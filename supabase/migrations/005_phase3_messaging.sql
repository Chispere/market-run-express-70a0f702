
-- Create conversations table for messaging between users and runners
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  runner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for storing individual messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table for system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "select_own_conversations" ON public.conversations
  FOR SELECT
  USING (user_id = auth.uid() OR runner_id = auth.uid());

CREATE POLICY "insert_conversations" ON public.conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR runner_id = auth.uid());

-- Messages policies
CREATE POLICY "select_conversation_messages" ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid() OR runner_id = auth.uid()
    )
  );

CREATE POLICY "insert_messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid() OR runner_id = auth.uid()
    )
  );

CREATE POLICY "update_own_messages" ON public.messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "select_own_notifications" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "update_own_notifications" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "insert_notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Update profiles table with additional fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_errands INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create function to automatically create conversation when errand is assigned
CREATE OR REPLACE FUNCTION create_conversation_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create conversation when errand is assigned (has runner_id)
  IF NEW.runner_id IS NOT NULL AND (OLD.runner_id IS NULL OR OLD.runner_id != NEW.runner_id) THEN
    INSERT INTO conversations (errand_id, user_id, runner_id)
    VALUES (NEW.id, NEW.user_id, NEW.runner_id)
    ON CONFLICT DO NOTHING;
    
    -- Create notification for runner
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      NEW.runner_id, 
      'New Errand Assigned', 
      'You have been assigned a new errand: ' || NEW.title,
      'assignment',
      '/errand/' || NEW.id
    );
    
    -- Create notification for user
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      NEW.user_id, 
      'Errand Assigned', 
      'Your errand "' || NEW.title || '" has been assigned to a runner',
      'assignment',
      '/errand/' || NEW.id
    );
  END IF;
  
  -- Create notification for status changes
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, title, message, type, action_url)
    VALUES (
      NEW.user_id, 
      'Errand Status Updated', 
      'Your errand "' || NEW.title || '" status changed to ' || NEW.status,
      'status_change',
      '/errand/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_assignment_trigger
  AFTER UPDATE ON errands
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_on_assignment();
