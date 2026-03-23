-- Create pathway_chat_messages table for team collaboration
CREATE TABLE public.pathway_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pathway_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pathway_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat access
CREATE POLICY "Anyone can view pathway chat messages" 
ON public.pathway_chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create chat messages" 
ON public.pathway_chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_pathway_chat_messages_pathway_id ON public.pathway_chat_messages(pathway_id, created_at DESC);

-- Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pathway_chat_messages;