-- PROPLAB Core Schema
-- Run this in your Supabase SQL Editor

-- 1. Workspaces (multi-project support)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    niche TEXT DEFAULT 'real_estate',
    city TEXT,
    country TEXT DEFAULT 'Ecuador',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties (your inventory)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    price_per_m2 NUMERIC,
    location TEXT NOT NULL,
    neighborhood TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bedrooms INTEGER DEFAULT 0,
    bathrooms NUMERIC DEFAULT 0,
    area_m2 NUMERIC,
    has_pool BOOLEAN DEFAULT false,
    property_type TEXT CHECK (property_type IN ('house', 'apartment', 'land', 'commercial', 'office', 'penthouse')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'rented')),
    image_url TEXT,
    gallery TEXT[], -- array of image URLs
    source TEXT DEFAULT 'manual', -- manual, scraped, imported
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Market Listings (competitive intelligence - scraped from portals)
CREATE TABLE IF NOT EXISTS public.market_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT,
    price NUMERIC,
    price_per_m2 NUMERIC,
    location TEXT,
    neighborhood TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    area_m2 NUMERIC,
    property_type TEXT,
    image_url TEXT,
    source_portal TEXT, -- plusvalia, olx, marketplace, properati
    source_url TEXT,
    days_on_market INTEGER DEFAULT 0,
    price_history JSONB DEFAULT '[]'::jsonb, -- [{date, price}]
    is_opportunity BOOLEAN DEFAULT false, -- flagged by AI as undervalued
    opportunity_score INTEGER, -- 0-100
    raw_text TEXT, -- original scraped text
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads (captured buyers/investors)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    whatsapp_number TEXT NOT NULL,
    user_name TEXT,
    email TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    budget_info TEXT,
    desired_location TEXT,
    desired_type TEXT,
    buyer_type TEXT DEFAULT 'end_user' CHECK (buyer_type IN ('end_user', 'investor', 'developer', 'unknown')),
    lead_score INTEGER DEFAULT 0, -- 0-100 AI-generated score
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'immediate')),
    source TEXT DEFAULT 'chat', -- chat, whatsapp, referral, portal, manual
    raw_message TEXT,
    property_id UUID REFERENCES public.properties(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Saved Searches (buyer radar)
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id),
    whatsapp_number TEXT NOT NULL,
    user_name TEXT,
    desired_location TEXT,
    max_price NUMERIC,
    min_bedrooms INTEGER,
    property_type TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Deals (sales pipeline)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id),
    property_id UUID REFERENCES public.properties(id),
    title TEXT NOT NULL,
    stage TEXT DEFAULT 'new_lead' CHECK (stage IN ('new_lead', 'contacted', 'showing', 'offer', 'negotiation', 'closed_won', 'closed_lost')),
    deal_value NUMERIC,
    commission_pct NUMERIC DEFAULT 3.0,
    notes TEXT,
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Knowledge Entries (AI context - property docs, brochures, specs)
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- general, property_spec, brochure, legal, pricing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Smart Alerts
CREATE TABLE IF NOT EXISTS public.smart_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'system' CHECK (type IN ('opportunity', 'lead', 'market', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (permissive for MVP - tighten for production)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;

-- Public read/write for MVP (use service key in API routes)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['workspaces','properties','market_listings','leads','saved_searches','deals','knowledge_entries','smart_alerts'])
    LOOP
        EXECUTE format('CREATE POLICY "Allow full access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;
