
-- Add payment tracking columns to errands table
ALTER TABLE errands 
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Create payments table for detailed payment tracking
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  runner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  runner_fee DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own payments
CREATE POLICY "select_own_payments" ON public.payments
  FOR SELECT
  USING (user_id = auth.uid() OR runner_id = auth.uid());

-- Allow system to insert payments
CREATE POLICY "insert_payments" ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Allow system to update payments
CREATE POLICY "update_payments" ON public.payments
  FOR UPDATE
  USING (true);

-- Update errand_items table to track actual costs
ALTER TABLE errand_items 
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2) DEFAULT 0;

-- Create function to calculate service fees
CREATE OR REPLACE FUNCTION calculate_service_fee(estimated_cost DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- Base service fee: 15% of estimated cost + fixed fee
  -- Minimum fee: $2.99, Maximum fee: $25.99
  RETURN GREATEST(2.99, LEAST(25.99, (estimated_cost * 0.15) + 1.99));
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate runner fee
CREATE OR REPLACE FUNCTION calculate_runner_fee(service_fee DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- Runner gets 80% of service fee
  RETURN service_fee * 0.80;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate fees when errand is created
CREATE OR REPLACE FUNCTION update_errand_fees()
RETURNS TRIGGER AS $$
BEGIN
  NEW.service_fee = calculate_service_fee(NEW.estimated_cost);
  NEW.total_amount = NEW.estimated_cost + NEW.service_fee;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_fees_trigger
  BEFORE INSERT OR UPDATE ON errands
  FOR EACH ROW
  EXECUTE FUNCTION update_errand_fees();
