'use client';

import { Property } from '@prisma/client';
import { getFreshnessInfo, formatConfidenceLevel } from '../lib/freshness';

interface FreshnessBadgeProps {
  property: Property;
  showConfidence?: boolean;
  showExpiry?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function FreshnessBadge({ 
  property, 
  showConfidence = true,
  showExpiry = false,
  size = 'md' 
}: FreshnessBadgeProps) {
  const { label, lastUpdatedText, confidenceScore, daysUntilExpiry } = getFreshnessInfo(property);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <div className="flex flex-col gap-1">
      {/* Main status badge */}
      <div 
        className={`inline-flex items-center rounded-full font-medium ${label.bgColor} ${label.color} ${sizeClasses[size]}`}
        title={label.tooltip}
      >
        <span className={iconSizes[size]}>{label.icon}</span>
        <span>{label.text}</span>
      </div>
      
      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {/* Last updated */}
        <span title="When this listing was last checked">
          {lastUpdatedText}
        </span>
        
        {/* Confidence score */}
        {showConfidence && (
          <>
            <span>•</span>
            <span 
              className={`font-medium ${
                confidenceScore >= 70 ? 'text-green-600' :
                confidenceScore >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}
              title="How confident we are in this listing's accuracy"
            >
              {formatConfidenceLevel(confidenceScore)} confidence
            </span>
          </>
        )}
        
        {/* Expiry warning */}
        {showExpiry && daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry > 0 && (
          <>
            <span>•</span>
            <span className="text-orange-600 font-medium">
              Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
            </span>
          </>
        )}
        
        {showExpiry && daysUntilExpiry === 0 && (
          <>
            <span>•</span>
            <span className="text-red-600 font-medium">
              Expires today
            </span>
          </>
        )}
        
        {/* Verification badge */}
        {property.verificationStatus === 'manually_confirmed' && (
          <>
            <span>•</span>
            <span className="text-blue-600 font-medium" title="Verified by our team">
              ✓ Verified
            </span>
          </>
        )}
        
        {property.partnerFeed && (
          <>
            <span>•</span>
            <span className="text-purple-600 font-medium" title="Direct from partner">
              Partner
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for cards/grid views
 */
export function FreshnessBadgeCompact({ property }: { property: Property }) {
  const { label, lastUpdatedText, confidenceScore } = getFreshnessInfo(property);
  
  return (
    <div className="flex items-center gap-2">
      <span 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${label.bgColor} ${label.color}`}
        title={label.tooltip}
      >
        <span>{label.icon}</span>
        <span className="hidden sm:inline">{label.text}</span>
      </span>
      
      <span className="text-xs text-gray-400" title={lastUpdatedText}>
        {lastUpdatedText.replace('Updated ', '').replace('today', '•').replace('yesterday', '1d')}
      </span>
      
      {confidenceScore < 50 && (
        <span className="text-xs text-red-500" title="Low confidence - verify before booking">
          ⚠
        </span>
      )}
    </div>
  );
}

/**
 * Mini dot indicator for minimal UI
 */
export function FreshnessDot({ property }: { property: Property }) {
  const { confidenceScore } = getFreshnessInfo(property);
  
  const colorClass = 
    confidenceScore >= 70 ? 'bg-green-500' :
    confidenceScore >= 50 ? 'bg-yellow-500' :
    confidenceScore >= 30 ? 'bg-orange-500' :
    'bg-red-500';
  
  return (
    <span 
      className={`inline-block w-2 h-2 rounded-full ${colorClass}`}
      title={`Confidence: ${confidenceScore}/100`}
    />
  );
}
