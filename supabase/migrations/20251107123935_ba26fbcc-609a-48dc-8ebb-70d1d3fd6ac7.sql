-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;

-- Create a new policy that allows anyone to view companies (public data)
CREATE POLICY "Anyone can view companies"
ON public.companies
FOR SELECT
USING (true);