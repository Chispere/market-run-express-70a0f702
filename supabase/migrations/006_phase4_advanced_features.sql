
-- Phase 4: Advanced Features & Polish

-- Add real-time messaging support
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Add runner ratings and reviews system
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID REFERENCES errands(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "select_reviews" ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "insert_own_reviews" ON public.reviews
  FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "update_own_reviews" ON public.reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid());

-- Add errand tracking and status updates
ALTER TABLE errands 
ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_notes TEXT[];

-- Create function to update runner ratings
CREATE OR REPLACE FUNCTION update_runner_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_reviews INTEGER;
BEGIN
  -- Calculate new average rating for the reviewed runner
  SELECT AVG(rating), COUNT(*) 
  INTO avg_rating, total_reviews
  FROM reviews 
  WHERE reviewed_id = NEW.reviewed_id;
  
  -- Update the runner's profile
  UPDATE profiles 
  SET rating = avg_rating, total_errands = total_reviews
  WHERE id = NEW.reviewed_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_runner_rating();

-- Add delivery preferences
CREATE TABLE IF NOT EXISTS public.delivery_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_delivery_time TEXT,
  special_instructions TEXT,
  contact_preference TEXT DEFAULT 'app',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on delivery preferences
ALTER TABLE public.delivery_preferences ENABLE ROW LEVEL SECURITY;

-- Delivery preferences policies
CREATE POLICY "select_own_delivery_preferences" ON public.delivery_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert_own_delivery_preferences" ON public.delivery_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_delivery_preferences" ON public.delivery_preferences
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add runner earnings tracking
CREATE TABLE IF NOT EXISTS public.runner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  errand_id UUID REFERENCES errands(id) ON DELETE CASCADE,
  base_amount DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_earnings DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on runner earnings
ALTER TABLE public.runner_earnings ENABLE ROW LEVEL SECURITY;

-- Runner earnings policies
CREATE POLICY "select_own_earnings" ON public.runner_earnings
  FOR SELECT
  USING (runner_id = auth.uid());

-- System can insert earnings
CREATE POLICY "insert_earnings" ON public.runner_earnings
  FOR INSERT
  WITH CHECK (true);

-- Create function to calculate and record earnings when errand is completed
CREATE OR REPLACE FUNCTION record_runner_earnings()
RETURNS TRIGGER AS $$
DECLARE
  service_fee_amount DECIMAL(10,2);
  platform_fee_amount DECIMAL(10,2);
  runner_earnings_amount DECIMAL(10,2);
BEGIN
  -- Only process when errand status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.runner_id IS NOT NULL THEN
    -- Calculate fees (assuming they're stored in the errand or calculated)
    service_fee_amount := NEW.total_cost * 0.15 + 1.99; -- 15% + $1.99
    platform_fee_amount := service_fee_amount * 0.20; -- Platform takes 20%
    runner_earnings_amount := service_fee_amount * 0.80; -- Runner gets 80%
    
    -- Record the earnings
    INSERT INTO runner_earnings (
      runner_id, 
      errand_id, 
      base_amount, 
      service_fee, 
      platform_fee, 
      net_earnings
    ) VALUES (
      NEW.runner_id,
      NEW.id,
      NEW.total_cost,
      service_fee_amount,
      platform_fee_amount,
      runner_earnings_amount
    );
    
    -- Create notification for runner
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      NEW.runner_id,
      'Payment Earned',
      'You earned $' || runner_earnings_amount || ' for completing "' || NEW.title || '"',
      'payment',
      '/dashboard'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_earnings_on_completion
  AFTER UPDATE ON errands
  FOR EACH ROW
  EXECUTE FUNCTION record_runner_earnings();
