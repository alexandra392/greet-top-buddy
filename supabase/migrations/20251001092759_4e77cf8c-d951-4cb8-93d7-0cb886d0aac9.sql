-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can create chat messages" ON public.pathway_chat_messages;

-- Create a more permissive policy for testing (allows anyone to insert)
CREATE POLICY "Anyone can create chat messages" 
ON public.pathway_chat_messages 
FOR INSERT 
WITH CHECK (true);