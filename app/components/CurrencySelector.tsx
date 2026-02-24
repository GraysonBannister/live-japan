'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from './CurrencyProvider';
import { SupportedCurrency, CURRENCY_DETAILS } from '../lib/currency';

export default function CurrencySelector() {
  const currencyContext = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle SSR case where context is null
  if (!currencyContext) {
    return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#78716C] bg-[#F5F1E8] rounded-lg opacity-50 cursor-not-allowed">
        <span>🇯🇵</span>
        <span>JPY</span>
      </button>
    );
  }
  
  const { currency, setCurrency, isLoading } = currencyContext;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const currentDetails = CURRENCY_DETAILS[currency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#78716C] hover:text-[#3F51B5] bg-[#F5F1E8] hover:bg-[#E7E5E4] rounded-lg transition-colors"
        disabled={isLoading}
      >
        <span>{currentDetails.flag}</span>
        <span>{currency}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-[#E7E5E4] py-1 z-50">
          {(Object.keys(CURRENCY_DETAILS) as SupportedCurrency[]).map((curr) => {
            const details = CURRENCY_DETAILS[curr];
            return (
              <button
                key={curr}
                onClick={() => handleSelect(curr)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[#F5F1E8] transition-colors ${
                  currency === curr ? 'bg-[#3F51B5]/10 text-[#3F51B5] font-medium' : 'text-[#2C2416]'
                }`}
              >
                <span>{details.flag}</span>
                <span>{curr}</span>
                <span className="text-xs text-[#78716C]">({details.symbol})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
