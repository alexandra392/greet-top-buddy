-- Fix pathway_chat_messages security issues

-- 1. Make user_id non-nullable and add proper constraints
ALTER TABLE public.pathway_chat_messages 
  ALTER COLUMN user_id SET NOT NULL;

-- 2. Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can view pathway chat messages" ON public.pathway_chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.pathway_chat_messages;

-- 3. Create secure RLS policies that require authentication
CREATE POLICY "Authenticated users can view pathway chat messages" 
  ON public.pathway_chat_messages 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create their own chat messages" 
  ON public.pathway_chat_messages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Add constraint to enforce message length limit
ALTER TABLE public.pathway_chat_messages 
  ADD CONSTRAINT message_length_check 
  CHECK (char_length(message) > 0 AND char_length(message) <= 1000);

-- 5. Add constraint to enforce user_name length limit
ALTER TABLE public.pathway_chat_messages 
  ADD CONSTRAINT user_name_length_check 
  CHECK (char_length(user_name) > 0 AND char_length(user_name) <= 100);