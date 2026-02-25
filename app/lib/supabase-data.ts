import { supabase } from './supabase';
import { Property } from '../types/property';

/**
 * Fetch all active properties from Supabase
 */
export async function getPropertiesFromSupabase(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('status_confidence_score', { ascending: false })
    .order('last_scraped_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return (data || []).map(mapSupabaseToProperty);
}

/**
 * Fetch a single property by ID
 */
export async function getPropertyById(id: number): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching property:', error);
    return null;
  }

  return mapSupabaseToProperty(data);
}

/**
 * Fetch properties for static generation
 */
export async function getPropertyIds(): Promise<{ id: number }[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching property IDs:', error);
    return [{ id: 1 }]; // Fallback
  }

  return data?.length ? data : [{ id: 1 }];
}

/**
 * Map Supabase snake_case fields to Property camelCase
 * Converts ISO date strings to Date objects
 */
function mapSupabaseToProperty(row: any): Property {
  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  return {
    id: row.id,
    externalId: row.external_id,
    sourceUrl: row.source_url,
    type: row.type,
    price: row.price,
    deposit: row.deposit,
    keyMoney: row.key_money,
    nearestStation: row.nearest_station,
    walkTime: row.walk_time,
    furnished: row.furnished,
    foreignerFriendly: row.foreigner_friendly,
    rooms: row.rooms,
    sizeSqm: row.size_sqm,
    photos: row.photos || [],
    descriptionEn: row.description_en,
    descriptionJp: row.description_jp,
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    availableFrom: parseDate(row.available_from),
    updatedAt: parseDate(row.updated_at) || new Date(),
    createdAt: parseDate(row.created_at) || new Date(),
    pricingPlans: row.pricing_plans,
    tags: row.tags,
    lastScrapedAt: parseDate(row.last_scraped_at),
    lastConfirmedAvailableAt: parseDate(row.last_confirmed_available_at),
    sourceLastUpdatedAt: parseDate(row.source_last_updated_at),
    statusConfidenceScore: row.status_confidence_score || 50,
    availabilityStatus: row.availability_status || 'unknown',
    contentHash: row.content_hash,
    lastContentChangeAt: parseDate(row.last_content_change_at),
    autoHideAfter: parseDate(row.auto_hide_after),
    isActive: row.is_active ?? true,
    partnerFeed: row.partner_feed ?? false,
    verificationStatus: row.verification_status || 'unverified',
    clickCount: row.click_count || 0,
    inquiryCount: row.inquiry_count || 0,
    lastInquiryAt: parseDate(row.last_inquiry_at),
  };
}
