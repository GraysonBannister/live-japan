'use client';

import Link from 'next/link';
import { Property } from '../types/property';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
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

  return (
    <Link href={`/property/${property.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={mainPhoto}
            alt={`Property in ${property.location}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {property.furnished && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                Furnished / 家具付き
              </span>
            )}
            {property.foreignerFriendly && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                Foreigner OK / 外国人可
              </span>
            )}
          </div>
          {/* Type Badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-gray-900/80 text-white text-xs font-medium rounded-full">
              {getTypeLabel(property.type)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </span>
            <span className="text-sm text-gray-500">/ month</span>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {property.location}
            </h3>
            <p className="text-sm text-gray-600">
              {property.nearestStation} • {property.walkTime} min walk / 徒歩{property.walkTime}分
            </p>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.descriptionEn}
          </p>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {(property.deposit !== null && property.deposit > 0) && (
              <span className="text-xs text-gray-500">
                Deposit: {formatPrice(property.deposit)}
              </span>
            )}
            {(property.deposit === 0) && (
              <span className="text-xs text-green-600 font-medium">
                No Deposit / 敷金なし
              </span>
            )}
            {(property.keyMoney !== null && property.keyMoney > 0) && (
              <span className="text-xs text-gray-500">
                Key Money: {formatPrice(property.keyMoney)}
              </span>
            )}
            {(property.keyMoney === 0) && (
              <span className="text-xs text-green-600 font-medium">
                No Key Money / 礼金なし
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
