'use client';

import { useContext, useState, useEffect } from 'react';
import { CurrencyContext } from './CurrencyProvider';

interface PriceDisplayProps {
  amount: number;
  className?: string;
  showOriginal?: boolean;
}

export default function PriceDisplay({ amount, className = '', showOriginal = false }: PriceDisplayProps) {
  const [mounted, setMounted] = useState(false);
  
  // Use useContext directly to avoid the error throwing
  const context = useContext(CurrencyContext);
  
  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // If no context (SSR/static gen) or not mounted yet, use fallback
  if (!context || !mounted) {
    return (
      <span className={className} suppressHydrationWarning>
        ¥{amount.toLocaleString('ja-JP')}
      </span>
    );
  }
  
  const { formatPrice, currency } = context;
  
  return (
    <span className={className} suppressHydrationWarning>
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
