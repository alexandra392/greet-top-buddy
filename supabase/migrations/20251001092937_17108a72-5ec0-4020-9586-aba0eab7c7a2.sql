-- Drop the foreign key constraint on user_id
ALTER TABLE public.pathway_chat_messages 
DROP CONSTRAINT IF EXISTS pathway_chat_messages_user_id_fkey;

-- Make user_id nullable so we can use mock users
ALTER TABLE public.pathway_chat_messages 
ALTER COLUMN user_id DROP NOT NULL;