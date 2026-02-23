export interface Property {
  id: number;
  type: string;
  price: number;
  deposit: number | null;
  keyMoney: number | null;
  nearestStation: string;
  walkTime: number;
  furnished: boolean;
  foreignerFriendly: boolean;
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
}

export type ViewMode = 'grid' | 'map';
