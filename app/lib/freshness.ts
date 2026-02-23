import { Property } from '@prisma/client';
import crypto from 'crypto';

export type AvailabilityStatus = 
  | 'unknown' 
  | 'available' 
  | 'likely_available' 
  | 'probably_unavailable' 
  | 'unavailable';

export type VerificationStatus = 
  | 'unverified' 
  | 'verified' 
  | 'manually_confirmed';

export interface FreshnessLabel {
  text: string;
  color: string;
  bgColor: string;
  tooltip: string;
  icon: string;
}

const STATUS_CONFIG: Record<AvailabilityStatus, FreshnessLabel> = {
  unknown: {
    text: 'Availability Unknown',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    tooltip: 'We have not confirmed availability for this listing',
    icon: '❓',
  },
  available: {
    text: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    tooltip: 'This listing was confirmed available recently',
    icon: '✓',
  },
  likely_available: {
    text: 'Likely Available',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    tooltip: 'This listing appears to be available based on recent data',
    icon: '✓',
  },
  probably_unavailable: {
    text: 'Probably Unavailable',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    tooltip: 'This listing may no longer be available',
    icon: '⚠',
  },
  unavailable: {
    text: 'Unavailable',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    tooltip: 'This listing is no longer available',
    icon: '✕',
  },
};

/**
 * Generate a content hash from key property fields
 * Used for change detection
 */
export function generateContentHash(data: {
  price: number;
  deposit?: number | null;
  keyMoney?: number | null;
  descriptionEn?: string;
  descriptionJp?: string | null;
  availableFrom?: Date | null;
}): string {
  const content = JSON.stringify({
    price: data.price,
    deposit: data.deposit,
    keyMoney: data.keyMoney,
    descriptionEn: data.descriptionEn?.substring(0, 200), // First 200 chars
    descriptionJp: data.descriptionJp?.substring(0, 200),
    availableFrom: data.availableFrom?.toISOString(),
  });
  
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Calculate confidence score based on various factors
 * Score range: 0-100
 */
export function calculateConfidenceScore(property: Property): number {
  let score = 50; // Base score
  const now = new Date();
  
  // Factor 1: Recency of scraping (max +30 points)
  if (property.lastScrapedAt) {
    const daysSinceScraped = Math.floor((now.getTime() - property.lastScrapedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceScraped <= 1) score += 30;
    else if (daysSinceScraped <= 3) score += 20;
    else if (daysSinceScraped <= 7) score += 10;
    else if (daysSinceScraped <= 14) score += 5;
    else score -= 10;
  } else {
    score -= 20; // Never scraped
  }
  
  // Factor 2: Partner feed vs scraped (max +20 points)
  if (property.partnerFeed) {
    score += 20;
  }
  
  // Factor 3: Verification status (max +15 points)
  switch (property.verificationStatus) {
    case 'manually_confirmed':
      score += 15;
      break;
    case 'verified':
      score += 10;
      break;
  }
  
  // Factor 4: Last confirmed available (max +15 points)
  if (property.lastConfirmedAvailableAt) {
    const daysSinceConfirmed = Math.floor((now.getTime() - property.lastConfirmedAvailableAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceConfirmed <= 3) score += 15;
    else if (daysSinceConfirmed <= 7) score += 10;
    else if (daysSinceConfirmed <= 14) score += 5;
  }
  
  // Factor 5: Click/inquiry activity (max +10 points)
  if (property.clickCount > 10 || property.inquiryCount > 0) {
    score += 10;
  } else if (property.clickCount > 5) {
    score += 5;
  }
  
  // Factor 6: Content change recency
  if (property.lastContentChangeAt) {
    const daysSinceChange = Math.floor((now.getTime() - property.lastContentChangeAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceChange <= 7) score += 5;
  }
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Check if a property should be auto-hidden
 * Based on autoHideAfter date
 */
export function shouldAutoHide(property: Property): boolean {
  if (!property.isActive) return false; // Already hidden
  if (!property.autoHideAfter) return false; // No expiry set
  
  const now = new Date();
  return now > property.autoHideAfter;
}

/**
 * Get human-readable freshness info
 */
export function getFreshnessInfo(property: Property): {
  label: FreshnessLabel;
  lastUpdatedText: string;
  confidenceScore: number;
  daysUntilExpiry: number | null;
} {
  const label = STATUS_CONFIG[property.availabilityStatus as AvailabilityStatus] || STATUS_CONFIG.unknown;
  const confidenceScore = calculateConfidenceScore(property);
  
  // Calculate last updated text
  let lastUpdatedText = 'Never updated';
  if (property.lastScrapedAt) {
    const days = Math.floor((new Date().getTime() - property.lastScrapedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) lastUpdatedText = 'Updated today';
    else if (days === 1) lastUpdatedText = 'Updated yesterday';
    else if (days < 7) lastUpdatedText = `Updated ${days} days ago`;
    else if (days < 30) lastUpdatedText = `Updated ${Math.floor(days / 7)} weeks ago`;
    else lastUpdatedText = `Updated ${Math.floor(days / 30)} months ago`;
  }
  
  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (property.autoHideAfter && property.isActive) {
    const days = Math.floor((property.autoHideAfter.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    daysUntilExpiry = Math.max(0, days);
  }
  
  return { label, lastUpdatedText, confidenceScore, daysUntilExpiry };
}

/**
 * Get availability label for UI display
 */
export function getAvailabilityLabel(property: Property): FreshnessLabel {
  return STATUS_CONFIG[property.availabilityStatus as AvailabilityStatus] || STATUS_CONFIG.unknown;
}

/**
 * Calculate auto-hide date based on property type and last update
 * Default: 14 days from last scrape
 */
export function calculateAutoHideDate(lastScrapedAt: Date, propertyType: string = 'monthly_mansion'): Date {
  const date = new Date(lastScrapedAt);
  
  // Different expiry windows based on category
  switch (propertyType) {
    case 'weekly_mansion':
      date.setDate(date.getDate() + 7); // 7 days for weekly
      break;
    case 'monthly_mansion':
    default:
      date.setDate(date.getDate() + 14); // 14 days for monthly
      break;
  }
  
  return date;
}

/**
 * Determine availability status based on scraping data
 */
export function determineAvailabilityStatus(
  pageContent: string,
  lastSeen: Date | null
): AvailabilityStatus {
  // Check for unavailable indicators
  const unavailableKeywords = [
    '満室',
    '契約済',
    'ご成約済',
    '募集終了',
    '物件削除',
    '取り扱い終了',
    '成約御礼',
  ];
  
  const lowerContent = pageContent.toLowerCase();
  
  for (const keyword of unavailableKeywords) {
    if (lowerContent.includes(keyword)) {
      return 'unavailable';
    }
  }
  
  // Check for warning indicators
  const warningKeywords = [
    '残り僅か',
    '人気物件',
    'お問い合わせ多数',
    '内見可能',
  ];
  
  for (const keyword of warningKeywords) {
    if (lowerContent.includes(keyword)) {
      return 'likely_available';
    }
  }
  
  // If recently seen, assume available
  if (lastSeen) {
    const daysSinceSeen = Math.floor((new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSeen <= 7) {
      return 'available';
    } else if (daysSinceSeen <= 14) {
      return 'likely_available';
    } else if (daysSinceSeen <= 30) {
      return 'probably_unavailable';
    }
  }
  
  return 'unknown';
}

/**
 * Format confidence score for display (0-100 -> Low/Medium/High/Very High)
 */
export function formatConfidenceLevel(score: number): string {
  if (score >= 85) return 'Very High';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'Low';
  return 'Very Low';
}
