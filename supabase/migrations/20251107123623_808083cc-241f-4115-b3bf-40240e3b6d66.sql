-- Create companies table for market activity
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_type TEXT NOT NULL CHECK (company_type IN ('feedstock', 'technology', 'product', 'market_uptaker')),
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  sector TEXT NOT NULL,
  application TEXT NOT NULL,
  state TEXT NOT NULL,
  fit INTEGER NOT NULL CHECK (fit >= 0 AND fit <= 100),
  website TEXT,
  headquarters TEXT,
  address TEXT,
  founded INTEGER,
  employee_range TEXT,
  annual_revenue TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view companies
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Insert sample data for feedstock providers
INSERT INTO public.companies (company_type, company_name, country, sector, application, state, fit, website, headquarters, address, founded, employee_range, annual_revenue, description) VALUES
('feedstock', 'BioSugar Technologies', 'United States', 'Agricultural Processing', 'Sugar Beet Processing', 'Active', 92, 'https://biosugar.com', 'Minneapolis, MN', '1250 Industrial Blvd, Minneapolis, MN 55401', 2015, '500-1000', '$250M - $500M', 'Leading provider of sugar beet-derived feedstocks for biochemical production. Specializes in high-purity xylose extraction.'),
('feedstock', 'Nordic Biomass Solutions', 'Sweden', 'Forestry & Biomass', 'Wood Processing', 'Active', 88, 'https://nordicbiomass.se', 'Stockholm, Sweden', 'Industrivägen 45, 113 51 Stockholm', 2012, '200-500', '$100M - $250M', 'Sustainable forestry company providing lignocellulosic biomass for bio-based chemical production.'),
('feedstock', 'AgriWaste Corp', 'Brazil', 'Agricultural Waste', 'Sugarcane Bagasse', 'Active', 85, 'https://agriwaste.com.br', 'São Paulo, Brazil', 'Av. Paulista 1000, São Paulo', 2018, '100-200', '$50M - $100M', 'Converts agricultural waste streams into valuable feedstocks for the bioeconomy.'),
('feedstock', 'EuroStarch Industries', 'Germany', 'Food Processing', 'Corn Starch', 'Active', 90, 'https://eurostarch.de', 'Hamburg, Germany', 'Hafenstraße 123, 20459 Hamburg', 2008, '1000-5000', '$500M - $1B', 'Major European starch processor with dedicated bio-chemical feedstock division.');

-- Insert sample data for technology providers
INSERT INTO public.companies (company_type, company_name, country, sector, application, state, fit, website, headquarters, address, founded, employee_range, annual_revenue, description) VALUES
('technology', 'EnzymeX Biotech', 'United States', 'Biotechnology', 'Enzyme Development', 'Active', 95, 'https://enzymex.com', 'San Francisco, CA', '500 Innovation Way, San Francisco, CA 94103', 2014, '50-100', '$25M - $50M', 'Develops proprietary enzyme cocktails for efficient biomass conversion and xylose fermentation.'),
('technology', 'BioReactor Systems Ltd', 'United Kingdom', 'Process Engineering', 'Fermentation Technology', 'Active', 89, 'https://bioreactorsys.co.uk', 'Cambridge, UK', 'Science Park Rd, Cambridge CB4 0FN', 2010, '100-200', '$50M - $100M', 'Advanced fermentation and bioprocess equipment manufacturer for biochemical production.'),
('technology', 'NanoFilter Tech', 'Japan', 'Separation Technology', 'Membrane Filtration', 'Active', 87, 'https://nanofilter.jp', 'Tokyo, Japan', '1-1-1 Shibuya, Tokyo 150-0002', 2016, '50-100', '$15M - $25M', 'Cutting-edge membrane separation technology for bio-based chemical purification.'),
('technology', 'GreenCatalyst Solutions', 'Netherlands', 'Chemical Engineering', 'Catalysis', 'Active', 91, 'https://greencatalyst.nl', 'Amsterdam, Netherlands', 'Sciencepark 904, 1098 XH Amsterdam', 2013, '30-50', '$10M - $25M', 'Sustainable catalysis solutions for bio-based chemical conversion processes.');

-- Insert sample data for product producers
INSERT INTO public.companies (company_type, company_name, country, sector, application, state, fit, website, headquarters, address, founded, employee_range, annual_revenue, description) VALUES
('product', 'BioXylose Manufacturing', 'United States', 'Biochemicals', 'Xylose Production', 'Active', 94, 'https://bioxylose.com', 'Chicago, IL', '2000 Manufacturing Dr, Chicago, IL 60601', 2011, '200-500', '$100M - $250M', 'Leading manufacturer of high-purity xylose for pharmaceutical and food applications.'),
('product', 'GreenChem Biochemicals', 'China', 'Specialty Chemicals', 'Bio-based Chemicals', 'Active', 86, 'https://greenchem.cn', 'Shanghai, China', 'No. 888 Huayuan Rd, Shanghai 200000', 2015, '500-1000', '$250M - $500M', 'Large-scale producer of bio-based chemicals including xylose derivatives and specialty sugars.'),
('product', 'SugarTech Industries', 'France', 'Food Ingredients', 'Specialty Sugars', 'Active', 88, 'https://sugartech.fr', 'Lyon, France', '15 Rue de Industrie, 69007 Lyon', 2009, '100-200', '$50M - $100M', 'Produces specialty sugars and sugar alcohols for food, pharma, and personal care markets.'),
('product', 'NaturalSweet Co', 'Canada', 'Natural Sweeteners', 'Alternative Sweeteners', 'Active', 82, 'https://naturalsweet.ca', 'Toronto, ON', '100 Queen St W, Toronto, ON M5H 2N2', 2017, '50-100', '$25M - $50M', 'Develops and manufactures natural, low-calorie sweeteners from bio-based feedstocks.');

-- Insert sample data for market uptakers
INSERT INTO public.companies (company_type, company_name, country, sector, application, state, fit, website, headquarters, address, founded, employee_range, annual_revenue, description) VALUES
('market_uptaker', 'PharmaBio Solutions', 'Switzerland', 'Pharmaceuticals', 'Active Ingredients', 'Active', 93, 'https://pharmabio.ch', 'Basel, Switzerland', 'Pharmastrasse 1, 4056 Basel', 2005, '5000-10000', '$5B - $10B', 'Global pharmaceutical company using bio-based xylose in drug formulations and active ingredients.'),
('market_uptaker', 'FoodTech International', 'United States', 'Food & Beverage', 'Food Additives', 'Active', 89, 'https://foodtechintl.com', 'New York, NY', '350 5th Ave, New York, NY 10118', 2008, '1000-5000', '$1B - $5B', 'Major food ingredient distributor incorporating bio-based sweeteners in food products.'),
('market_uptaker', 'CosmoCare Beauty', 'South Korea', 'Personal Care', 'Cosmetic Ingredients', 'Active', 85, 'https://cosmocare.kr', 'Seoul, South Korea', '123 Gangnam-daero, Seoul 06028', 2014, '200-500', '$100M - $250M', 'Innovative cosmetics manufacturer using sustainable bio-based ingredients in formulations.'),
('market_uptaker', 'ChemSupply Global', 'Germany', 'Chemical Distribution', 'Industrial Chemicals', 'Active', 87, 'https://chemsupply.de', 'Frankfurt, Germany', 'Chemiestrasse 50, 60486 Frankfurt', 2010, '500-1000', '$500M - $1B', 'Leading chemical distributor incorporating bio-based chemicals into industrial supply chains.');