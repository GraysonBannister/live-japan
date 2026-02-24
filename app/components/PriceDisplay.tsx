'use client';

import { useContext } from 'react';
import { CurrencyContext } from './CurrencyProvider';
import { formatCurrencyValue } from '../lib/currency';

interface PriceDisplayProps {
  amount: number;
  className?: string;
  showOriginal?: boolean;
}

export default function PriceDisplay({ amount, className = '', showOriginal = false }: PriceDisplayProps) {
  // Use useContext directly to avoid the error throwing
  const context = useContext(CurrencyContext);
  
  // If no context (SSR/static gen), use fallback
  if (!context) {
    return (
      <span className={className}>
        ¥{amount.toLocaleString('ja-JP')}
      </span>
    );
  }
  
  const { formatPrice, currency } = context;
  
  return (
    <span className={className}>
      {formatPrice(amount)}
      {showOriginal && currency !== 'JPY' && (
        <span className="text-sm text-[#78716C] ml-1">
          (¥{amount.toLocaleString()})
        </span>
      )}
    </span>
  );
}

// Component for the price label (e.g., "/ month")
export function PriceLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
