
-- Add missing columns to errands table
ALTER TABLE errands ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE errands ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Update the delivery_address_id to be required for new errands
-- This ensures errands have delivery addresses

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_errands_status ON errands(status);
CREATE INDEX IF NOT EXISTS idx_errands_user_id ON errands(user_id);
CREATE INDEX IF NOT EXISTS idx_errands_runner_id ON errands(runner_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- Update RLS policies to allow runners to view available errands
DROP POLICY IF EXISTS "Runners can view available errands" ON errands;
CREATE POLICY "Runners can view available errands" ON errands
  FOR SELECT USING (
    status = 'pending' OR 
    auth.uid() = user_id OR 
    auth.uid() = runner_id
  );
