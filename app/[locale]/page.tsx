import { prisma } from '../lib/prisma';
import SearchFormWrapper from '../components/SearchFormWrapper';
import PropertyGrid from '../components/PropertyGrid';
import { Property } from '../types/property';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Generate static pages for all locales at build time
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ja' }];
}

// Force static generation
export const dynamic = 'force-static';

async function getProperties(): Promise<Property[]> {
  const properties = await prisma.property.findMany({
    where: {
      isActive: true, // Only show active listings
    },
    orderBy: [
      { statusConfidenceScore: 'desc' }, // Higher confidence first
      { lastScrapedAt: 'desc' },         // Then most recently updated
    ],
  });

  return properties as Property[];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('hero');
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section - Japanese Indigo Gradient */}
      <div className="bg-gradient-to-br from-[#3F51B5] to-[#283593] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-2 px-2 sm:px-0">
              {t('subtitle')}
            </p>
            <p className="text-base sm:text-lg text-white/70 mb-6 sm:mb-8">
              {t('subtitleJa')}
            </p>
            
            {/* Quick View Toggle */}
            <div className="flex justify-center gap-3 sm:gap-4">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                </svg>
                <span className="hidden sm:inline">{t('viewMap')}</span>
                <span className="sm:hidden">Map</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-[#FDFBF7] rounded-xl shadow-lg p-6 border border-[#E7E5E4]">
          <SearchFormWrapper />
        </div>
      </div>

      {/* Listings Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid initialProperties={properties} />
      </main>

      {/* Footer - Japanese Ink Dark */}
      <footer className="bg-[#2C2416] text-[#A8A29E] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-[#F5F1E8] text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('footerTitle')}</h3>
              <p className="text-sm">{t('footerDescription')}</p>
            </div>
            <div>
              <h4 className="text-[#F5F1E8] font-semibold mb-3 sm:mb-4">{t('propertyTypes')}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t('monthly')}</li>
                <li>{t('weekly')}</li>
                <li>{t('apartment')}</li>
              </ul>
            </div>
            <div className="sm:col-span-2 md:col-span-1">
              <h4 className="text-[#F5F1E8] font-semibold mb-3 sm:mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/map" className="hover:text-[#F5F1E8] transition-colors">
                    {t('viewMap')}
                  </Link>
                </li>
                <li>{t('email')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3D3426] mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>{t('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
