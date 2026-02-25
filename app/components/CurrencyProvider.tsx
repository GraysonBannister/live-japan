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
  getStoredCurrency,
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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Start with JPY for SSR, then update from storage on client
  const [currency, setCurrencyState] = useState<SupportedCurrency>('JPY');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // On mount, read from storage and update currency
  useEffect(() => {
    setIsClient(true);
    
    // Read from cookie/localStorage
    const stored = getStoredCurrency();
    console.log('[CurrencyProvider] Stored currency:', stored);
    if (stored) {
      setCurrencyState(stored);
    } else {
      // No stored preference, use detected currency
      const detected = detectUserCurrency();
      console.log('[CurrencyProvider] Detected currency:', detected);
      setCurrencyState(detected);
      setStoredCurrency(detected);
    }
  }, []);

  // Fetch exchange rates on mount
  useEffect(() => {
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

  // Create a wrapper setCurrency that updates both state and storage
  const handleSetCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    setStoredCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
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
