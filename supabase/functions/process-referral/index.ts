import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Commission rates by tier (on purchase)
const getCommissionRate = (vipLevel: number): number => {
  if (vipLevel >= 4) return 0.10; // Tier A - 10%
  if (vipLevel >= 2) return 0.03; // Tier B - 3%
  return 0.02; // Tier C - 2%
};

// Rabat rates by tier (on daily profit)
const getRabatRate = (vipLevel: number): number => {
  if (vipLevel >= 4) return 0.05; // Tier A - 5%
  if (vipLevel >= 2) return 0.03; // Tier B - 3%
  return 0.02; // Tier C - 2%
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, amount, type } = await req.json();

    if (!userId || !amount || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, amount, type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${type} for user ${userId}, amount: ${amount}`);

    // Get investor profile to find who referred them
    const { data: investor, error: investorError } = await supabaseAdmin
      .from("profiles")
      .select("referred_by, name")
      .eq("user_id", userId)
      .single();

    if (investorError || !investor?.referred_by) {
      console.log("No referrer found for user:", userId);
      return new Response(
        JSON.stringify({ success: true, message: "No referrer found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${investor.name} was referred by code: ${investor.referred_by}`);

    // Find referrer by referral code
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("referral_code", investor.referred_by)
      .single();

    if (referrerError || !referrer) {
      console.log("Referrer not found for code:", investor.referred_by);
      return new Response(
        JSON.stringify({ success: true, message: "Referrer not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found referrer: ${referrer.name} (VIP ${referrer.vip_level})`);

    let reward = 0;
    let rewardType = "";
    let description = "";

    if (type === "commission") {
      // Commission on purchase
      const commissionRate = getCommissionRate(referrer.vip_level);
      reward = Math.floor(amount * commissionRate);
      rewardType = "commission";
      description = `Komisi ${(commissionRate * 100).toFixed(0)}% dari pembelian ${investor.name}`;
      
      console.log(`Commission rate: ${commissionRate * 100}%, reward: ${reward}`);

      if (reward > 0) {
        // Update referrer balance and team_income
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            balance: referrer.balance + reward,
            team_income: (referrer.team_income || 0) + reward,
            total_income: (referrer.total_income || 0) + reward,
          })
          .eq("user_id", referrer.user_id);

        if (updateError) {
          console.error("Error updating referrer profile:", updateError);
          throw updateError;
        }
      }
    } else if (type === "rabat") {
      // Rabat on daily profit
      const rabatRate = getRabatRate(referrer.vip_level);
      reward = Math.floor(amount * rabatRate);
      rewardType = "rabat";
      description = `Rabat ${(rabatRate * 100).toFixed(0)}% dari profit harian ${investor.name}`;

      console.log(`Rabat rate: ${rabatRate * 100}%, reward: ${reward}`);

      if (reward > 0) {
        // Update referrer balance and rabat_income
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            balance: referrer.balance + reward,
            rabat_income: (referrer.rabat_income || 0) + reward,
            total_income: (referrer.total_income || 0) + reward,
          })
          .eq("user_id", referrer.user_id);

        if (updateError) {
          console.error("Error updating referrer profile:", updateError);
          throw updateError;
        }
      }
    }

    if (reward > 0) {
      // Create transaction for referrer
      const { error: txError } = await supabaseAdmin
        .from("transactions")
        .insert({
          user_id: referrer.user_id,
          type: rewardType,
          amount: reward,
          status: "success",
          description: description,
        });

      if (txError) {
        console.error("Error creating transaction:", txError);
        throw txError;
      }

      console.log(`Successfully processed ${rewardType}: ${reward} for ${referrer.name}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reward,
        referrerName: referrer.name,
        type: rewardType 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing referral:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
