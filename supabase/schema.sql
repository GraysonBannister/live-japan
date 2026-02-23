-- Supabase schema for Live Japan listings
-- Run this in Supabase SQL Editor

-- Enable RLS
alter table if exists properties enable row level security;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT UNIQUE,
    source_url TEXT UNIQUE,
    type TEXT NOT NULL DEFAULT 'monthly_mansion',
    price INTEGER NOT NULL,
    deposit INTEGER,
    key_money INTEGER,
    nearest_station TEXT NOT NULL,
    walk_time INTEGER NOT NULL DEFAULT 10,
    furnished BOOLEAN NOT NULL DEFAULT true,
    foreigner_friendly BOOLEAN NOT NULL DEFAULT true,
    photos JSONB DEFAULT '[]'::jsonb,
    description_en TEXT,
    description_jp TEXT,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    available_from TIMESTAMPTZ,
    
    -- Freshness tracking
    last_scraped_at TIMESTAMPTZ,
    last_confirmed_available_at TIMESTAMPTZ,
    source_last_updated_at TIMESTAMPTZ,
    status_confidence_score INTEGER DEFAULT 50,
    availability_status TEXT DEFAULT 'unknown',
    content_hash TEXT,
    last_content_change_at TIMESTAMPTZ,
    auto_hide_after TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    partner_feed BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'unverified',
    click_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    last_inquiry_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active listings
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_confidence ON properties(status_confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- RLS Policies
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
CREATE POLICY "Public can view active properties"
    ON properties FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage properties" ON properties;
CREATE POLICY "Authenticated users can manage properties"
    ON properties FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Enable realtime
alter publication supabase_realtime add table properties;
