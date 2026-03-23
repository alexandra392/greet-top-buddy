-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  goal TEXT NOT NULL,
  pathways JSONB NOT NULL DEFAULT '[]'::jsonb,
  topic TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for now, no auth required)
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Create policy for public insert access (for now, no auth required)
CREATE POLICY "Anyone can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Anyone can update projects" 
ON public.projects 
FOR UPDATE 
USING (true);

-- Create policy for public delete access
CREATE POLICY "Anyone can delete projects" 
ON public.projects 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();