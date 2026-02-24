'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SupportedCurrency,
  ExchangeRates,
  fetchExchangeRates,
  convertCurrency,
  formatCurrencyValue,
  detectUserCurrency,
  getStoredCurrency,
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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('JPY');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load currency preference and fetch rates on mount
  useEffect(() => {
    const loadCurrency = async () => {
      const stored = getStoredCurrency();
      const initialCurrency = stored || detectUserCurrency();
      setCurrencyState(initialCurrency);
      
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
    
    loadCurrency();
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
