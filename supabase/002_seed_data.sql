-- PROPLAB Initial Setup
-- Creates only the workspace. ALL property data comes from the scraper.
-- Run: /api/scrape?city=all&mode=properties to populate real data.

-- 1. Create workspace (no fake properties — scraper is the single source of truth)
INSERT INTO public.workspaces (id, name, description, city, country) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ecuador Intelligence', 'Inteligencia inmobiliaria de todo Ecuador — datos 100% reales', 'Nacional', 'Ecuador');

-- NOTE: To populate the database with real data:
-- 1. Properties:     GET /api/scrape?city=all&mode=properties
-- 2. Market Intel:   GET /api/scrape?city=all&mode=market
-- All data comes from MercadoLibre's API with real photos, prices, and locations.
