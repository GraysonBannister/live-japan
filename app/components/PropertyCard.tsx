'use client';

import Link from 'next/link';
import { Property } from '../types/property';
import { useState, useContext } from 'react';
import FreshnessBadge, { FreshnessDot } from './FreshnessBadge';
import { CurrencyContext } from './CurrencyProvider';

interface PropertyCardProps {
  property: Property;
  showFreshness?: boolean;
}

export default function PropertyCard({ property, showFreshness = true }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  
  // Use context directly to avoid errors during SSR
  const currencyContext = useContext(CurrencyContext);
  
  // Fallback formatter for SSR/static generation
  const formatPrice = (amount: number) => {
    if (!currencyContext) {
      return `¥${amount.toLocaleString('ja-JP')}`;
    }
    return currencyContext.formatPrice(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly_mansion':
        return 'Monthly Mansion / マンスリーマンション';
      case 'weekly_mansion':
        return 'Weekly Mansion / ウィークリーマンション';
      case 'apartment':
        return 'Apartment / アパート';
      default:
        return type;
    }
  };

  const mainPhoto = property.photos?.[0] || '/placeholder-property.jpg';
  const displayPhoto = imgError ? '/placeholder-property.jpg' : mainPhoto;

  // Don't show hidden listings unless explicitly viewing them
  if (!property.isActive) {
    return null;
  }

  return (
    <Link href={`/property/${property.id}`} className="group">
      <div className="bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E7E5E4] overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F1E8]">
          <img
            src={displayPhoto}
            alt={`Property in ${property.location}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {property.furnished && (
              <span className="px-2 py-1 bg-[#6B8E23] text-white text-xs font-medium rounded-full">
                Furnished / 家具付き
              </span>
            )}
            {property.foreignerFriendly && (
              <span className="px-2 py-1 bg-[#3F51B5] text-white text-xs font-medium rounded-full">
                Foreigner OK / 外国人可
              </span>
            )}
          </div>
          
          {/* Freshness Dot - subtle indicator */}
          {showFreshness && (
            <div className="absolute top-3 right-3">
              <FreshnessDot property={property} />
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-[#2C2416]/80 text-white text-xs font-medium rounded-full">
              {getTypeLabel(property.type)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#D84315]">
              {formatPrice(property.price)}
            </span>
            <span className="text-sm text-[#78716C]">/ month</span>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <h3 className="font-semibold text-[#2C2416] text-lg">
              {property.location}
            </h3>
            <p className="text-sm text-[#78716C]">
              {property.nearestStation} • {property.walkTime} min walk / 徒歩{property.walkTime}分
            </p>
          </div>

          {/* Freshness Badge */}
          {showFreshness && (
            <FreshnessBadge property={property} showConfidence={false} size="sm" />
          )}

          {/* Description Preview */}
          <p className="text-sm text-[#78716C] line-clamp-2">
            {property.descriptionEn}
          </p>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E7E5E4]">
            {(property.deposit !== null && property.deposit > 0) && (
              <span className="text-xs text-[#78716C]">
                Deposit: {formatPrice(property.deposit)}
              </span>
            )}
            {(property.deposit === 0) && (
              <span className="text-xs text-[#6B8E23] font-medium">
                No Deposit / 敷金なし
              </span>
            )}
            {(property.keyMoney !== null && property.keyMoney > 0) && (
              <span className="text-xs text-[#78716C]">
                Key Money: {formatPrice(property.keyMoney)}
              </span>
            )}
            {(property.keyMoney === 0) && (
              <span className="text-xs text-[#6B8E23] font-medium">
                No Key Money / 礼金なし
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
