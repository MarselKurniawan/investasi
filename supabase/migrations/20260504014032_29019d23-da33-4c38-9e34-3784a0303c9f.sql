
-- Add spin tickets to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spin_tickets integer NOT NULL DEFAULT 0;

-- Wheel spin history
CREATE TABLE IF NOT EXISTS public.wheel_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins" ON public.wheel_spins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.wheel_spins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all spins" ON public.wheel_spins
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: when new profile is created with referred_by, give referrer +1 spin ticket
CREATE OR REPLACE FUNCTION public.grant_referral_spin_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by <> '' THEN
    UPDATE public.profiles
    SET spin_tickets = spin_tickets + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_referral_spin_ticket ON public.profiles;
CREATE TRIGGER trg_grant_referral_spin_ticket
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_referral_spin_ticket();
