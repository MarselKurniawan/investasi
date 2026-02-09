import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Nomor WhatsApp diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FONNTE_API_TOKEN = Deno.env.get("FONNTE_API_TOKEN");
    if (!FONNTE_API_TOKEN) {
      console.error("FONNTE_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Konfigurasi server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Clean up old OTPs for this phone
    await supabase.from("otp_codes").delete().eq("phone", phone).lt("expires_at", new Date().toISOString());

    // Store OTP
    const { error: insertError } = await supabase.from("otp_codes").insert({
      phone,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Gagal menyimpan kode OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Fonnte
    const message = `Kode verifikasi InvestPro Anda: *${otp}*\n\nKode berlaku 5 menit. Jangan berikan kode ini kepada siapapun.`;

    const formData = new FormData();
    formData.append("target", phone);
    formData.append("message", message);

    const fonntResponse = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_API_TOKEN,
      },
      body: formData,
    });

    const fonntResult = await fonntResponse.json();
    console.log("Fonnte response:", JSON.stringify(fonntResult));

    if (!fonntResponse.ok || fonntResult.status === false) {
      console.error("Fonnte API error:", fonntResult);
      return new Response(
        JSON.stringify({ error: "Gagal mengirim OTP ke WhatsApp" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Kode OTP telah dikirim ke WhatsApp Anda" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
