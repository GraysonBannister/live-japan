// Currency conversion utility for live-japan
// Uses real-time exchange rates from free APIs

export type SupportedCurrency = 'JPY' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'CNY' | 'KRW';

export const CURRENCY_DETAILS: Record<SupportedCurrency, { 
  symbol: string; 
  name: string; 
  locale: string;
  flag: string;
}> = {
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', flag: '🇯🇵' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB', flag: '🇬🇧' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', flag: '🇦🇺' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', flag: '🇨🇦' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', flag: '🇨🇳' },
  KRW: { symbol: '₩', name: 'Korean Won', locale: 'ko-KR', flag: '🇰🇷' },
};

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Cache for exchange rates
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch real-time exchange rates from API
 */
export async function fetchExchangeRates(base: SupportedCurrency = 'JPY'): Promise<ExchangeRates> {
  const now = Date.now();
  
  // Return cached rates if fresh
  if (cachedRates && cachedRates.base === base && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedRates;
  }
  
  try {
    // Try open.er-api.com (free, no API key needed)
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.result === 'success' && data.rates) {
        cachedRates = {
          base: data.base_code || base,
          date: data.time_last_update_utc || new Date().toISOString(),
          rates: data.rates,
        };
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch (e) {
    console.warn('Exchange rate API failed, using fallback:', e);
  }
  
  return getFallbackRates(base);
}

/**
 * Fallback rates if API fails
 */
function getFallbackRates(base: SupportedCurrency): ExchangeRates {
  const fallbackRates: Record<SupportedCurrency, Record<string, number>> = {
    JPY: {
      JPY: 1,
      USD: 0.0067,
      EUR: 0.0062,
      GBP: 0.0052,
      AUD: 0.010,
      CAD: 0.0094,
      CNY: 0.048,
      KRW: 9.2,
    },
    USD: {
      JPY: 149,
      USD: 1,
      EUR: 0.925,
      GBP: 0.77,
      AUD: 1.53,
      CAD: 1.41,
      CNY: 7.24,
      KRW: 1370,
    },
    EUR: {
      JPY: 161,
      USD: 1.08,
      EUR: 1,
      GBP: 0.83,
      AUD: 1.65,
      CAD: 1.52,
      CNY: 7.82,
      KRW: 1480,
    },
    GBP: {
      JPY: 193,
      USD: 1.30,
      EUR: 1.20,
      GBP: 1,
      AUD: 1.98,
      CAD: 1.83,
      CNY: 9.40,
      KRW: 1780,
    },
    AUD: {
      JPY: 98.0,
      USD: 0.654,
      EUR: 0.606,
      GBP: 0.505,
      AUD: 1,
      CAD: 0.924,
      CNY: 4.74,
      KRW: 896,
    },
    CAD: {
      JPY: 106,
      USD: 0.709,
      EUR: 0.658,
      GBP: 0.547,
      AUD: 1.08,
      CAD: 1,
      CNY: 5.13,
      KRW: 970,
    },
    CNY: {
      JPY: 20.8,
      USD: 0.138,
      EUR: 0.128,
      GBP: 0.106,
      AUD: 0.211,
      CAD: 0.195,
      CNY: 1,
      KRW: 189,
    },
    KRW: {
      JPY: 0.109,
      USD: 0.00073,
      EUR: 0.00068,
      GBP: 0.00056,
      AUD: 0.00112,
      CAD: 0.00103,
      CNY: 0.0053,
      KRW: 1,
    },
  };
  
  return {
    base,
    date: new Date().toISOString(),
    rates: fallbackRates[base] || fallbackRates.JPY,
  };
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: ExchangeRates
): number {
  if (from === to) return amount;
  
  const rate = rates.rates[to];
  if (!rate) {
    console.warn(`No rate found for ${to}, returning original amount`);
    return amount;
  }
  
  return amount * rate;
}

/**
 * Format currency for display
 */
export function formatCurrencyValue(
  amount: number,
  currency: SupportedCurrency
): string {
  const details = CURRENCY_DETAILS[currency];
  
  // JPY and KRW have no decimal places
  const fractionDigits = (currency === 'JPY' || currency === 'KRW') ? 0 : 2;
  
  const formatted = amount.toLocaleString(details.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  
  // Handle symbol placement
  if (currency === 'JPY' || currency === 'CNY' || currency === 'USD' || currency === 'GBP') {
    return `${details.symbol}${formatted}`;
  }
  if (currency === 'KRW') {
    return `${details.symbol}${formatted}`;
  }
  // For EUR, AUD, CAD
  return `${details.symbol}${formatted}`;
}

/**
 * Detect user's preferred currency from browser locale
 */
export function detectUserCurrency(): SupportedCurrency {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  
  const localeToCurrency: Record<string, SupportedCurrency> = {
    'ja-JP': 'JPY', 'ja': 'JPY',
    'en-US': 'USD', 'en': 'USD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-CA': 'CAD',
    'de-DE': 'EUR', 'de': 'EUR', 'fr-FR': 'EUR', 'fr': 'EUR',
    'es-ES': 'EUR', 'es': 'EUR', 'it-IT': 'EUR', 'it': 'EUR',
    'zh-CN': 'CNY', 'zh': 'CNY', 'zh-TW': 'CNY',
    'ko-KR': 'KRW', 'ko': 'KRW',
  };
  
  // Check exact match first
  if (localeToCurrency[locale]) {
    return localeToCurrency[locale];
  }
  
  // Check language only
  const lang = locale.split('-')[0];
  if (localeToCurrency[lang]) {
    return localeToCurrency[lang];
  }
  
  return 'USD'; // Default fallback
}

// Cookie helpers for SSR-compatible storage
function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// localStorage helpers (legacy support)
function getLocalStorageCurrency(): SupportedCurrency | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('livejapan-currency');
  return stored as SupportedCurrency | null;
}

function setLocalStorageCurrency(currency: SupportedCurrency): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('livejapan-currency', currency);
}

// Unified storage API - uses cookies (for cross-page persistence) + localStorage (for compatibility)
export function getStoredCurrency(): SupportedCurrency | null {
  // Debug: log all cookies
  if (typeof document !== 'undefined') {
    console.log('[Currency] All cookies:', document.cookie);
  }
  
  // Try cookie first (works across page loads)
  const cookieValue = getCookie('livejapan-currency');
  console.log('[Currency] Cookie value:', cookieValue);
  if (cookieValue && CURRENCY_DETAILS[cookieValue as SupportedCurrency]) {
    return cookieValue as SupportedCurrency;
  }
  
  // Fallback to localStorage for legacy users
  const localValue = getLocalStorageCurrency();
  console.log('[Currency] localStorage value:', localValue);
  if (localValue) {
    // Migrate to cookie for future requests
    setCookie('livejapan-currency', localValue);
    return localValue;
  }
  
  return null;
}

export function setStoredCurrency(currency: SupportedCurrency): void {
  console.log('[Currency] Saving currency:', currency);
  setCookie('livejapan-currency', currency);
  setLocalStorageCurrency(currency);
  
  // Verify cookie was set
  if (typeof document !== 'undefined') {
    console.log('[Currency] Cookie after set:', document.cookie);
  }
}
