'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SupportedCurrency,
  CURRENCY_DETAILS,
  ExchangeRates,
  fetchExchangeRates,
  convertCurrency,
  formatCurrencyValue,
  detectUserCurrency,
  setStoredCurrency,
} from '../lib/currency';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  convertPrice: (amountJPY: number) => number;
  formatPrice: (amountJPY: number) => string;
  formatConvertedPrice: (amount: number) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Helper to get initial currency synchronously (prevents flash of JPY)
function getInitialCurrency(): SupportedCurrency {
  if (typeof document === 'undefined') return 'JPY';
  
  // Read cookie directly for synchronous access
  const match = document.cookie.match(/livejapan-currency=([^;]+)/);
  if (match) {
    const cookieValue = decodeURIComponent(match[1]);
    if (CURRENCY_DETAILS[cookieValue as SupportedCurrency]) {
      return cookieValue as SupportedCurrency;
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('livejapan-currency');
    if (stored && CURRENCY_DETAILS[stored as SupportedCurrency]) {
      return stored as SupportedCurrency;
    }
  }
  
  // Final fallback to detected currency
  return detectUserCurrency();
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from storage to prevent flash
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getInitialCurrency);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch exchange rates on mount
  useEffect(() => {
    setIsMounted(true);
    
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const rates = await fetchExchangeRates('JPY');
        setExchangeRates(rates);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRates();
  }, []);

  // Refresh rates every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rates = await fetchExchangeRates('JPY');
        setExchangeRates(rates);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to refresh exchange rates:', error);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    setStoredCurrency(newCurrency);
  };

  const convertPrice = (amountJPY: number): number => {
    if (!exchangeRates || currency === 'JPY') return amountJPY;
    return convertCurrency(amountJPY, 'JPY', currency, exchangeRates);
  };

  const formatPrice = (amountJPY: number): string => {
    const converted = convertPrice(amountJPY);
    return formatConvertedPrice(converted);
  };

  const formatConvertedPrice = (amount: number): string => {
    return formatCurrencyValue(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates,
        isLoading,
        lastUpdated,
        convertPrice,
        formatPrice,
        formatConvertedPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  // Return null instead of throwing for SSR/static generation compatibility
  if (context === undefined) {
    return null;
  }
  return context;
}
