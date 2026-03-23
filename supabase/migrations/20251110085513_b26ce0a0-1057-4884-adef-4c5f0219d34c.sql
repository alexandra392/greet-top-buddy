
-- Add columns for tracking patents, projects, and publications
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS patents_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS projects_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS publications_count integer DEFAULT 0;

-- Add some mock data to existing companies
UPDATE public.companies 
SET patents_count = 12, projects_count = 8, publications_count = 23
WHERE company_name = 'BioSugar Technologies';

UPDATE public.companies 
SET patents_count = 15, projects_count = 12, publications_count = 31
WHERE id IN (
  SELECT id FROM companies 
  WHERE company_type = 'technology' 
  ORDER BY company_name 
  LIMIT 3
);

UPDATE public.companies 
SET patents_count = 5, projects_count = 3, publications_count = 8
WHERE id IN (
  SELECT id FROM companies 
  WHERE company_type = 'product' 
  ORDER BY company_name 
  LIMIT 3
);

UPDATE public.companies 
SET patents_count = 8, projects_count = 6, publications_count = 18
WHERE id IN (
  SELECT id FROM companies 
  WHERE company_type = 'feedstock' 
  ORDER BY company_name 
  LIMIT 2
);
