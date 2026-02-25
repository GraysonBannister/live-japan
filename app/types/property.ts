export interface Property {
  id: number;
  externalId: string | null;
  sourceUrl: string | null;
  type: string;
  price: number;
  deposit: number | null;
  keyMoney: number | null;
  nearestStation: string;
  walkTime: number;
  furnished: boolean;
  foreignerFriendly: boolean;
  rooms: number | null;
  sizeSqm: number | null;
  photos: string[];
  descriptionEn: string;
  descriptionJp: string | null;
  location: string;
  lat: number | null;
  lng: number | null;
  availableFrom: Date | null;
  updatedAt: Date;
  createdAt: Date;
  pricingPlans: any[] | null;
  tags: string[] | null;
  // Freshness tracking fields
  lastScrapedAt: Date | null;
  lastConfirmedAvailableAt: Date | null;
  sourceLastUpdatedAt: Date | null;
  statusConfidenceScore: number;
  availabilityStatus: string;
  contentHash: string | null;
  lastContentChangeAt: Date | null;
  autoHideAfter: Date | null;
  isActive: boolean;
  partnerFeed: boolean;
  verificationStatus: string;
  clickCount: number;
  inquiryCount: number;
  lastInquiryAt: Date | null;
}

export interface SearchFilters {
  area?: string;
  minPrice?: string;
  maxPrice?: string;
  type?: string;
  maxWalkTime?: string;
  furnished?: boolean;
  foreignerFriendly?: boolean;
  minRooms?: string;
  maxRooms?: string;
  minSize?: string;
  maxSize?: string;
  sizeUnit?: 'sqm' | 'sqft';
}

export type ViewMode = 'grid' | 'map';
