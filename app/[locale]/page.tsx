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
    orderBy: {
      id: 'desc'
    }
  });

  return properties as Property[];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Home');
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              {t('subtitle')}
            </p>
            <p className="text-lg text-blue-200 mb-8">
              {t('subtitleJa')}
            </p>
            
            {/* Quick View Toggle */}
            <div className="flex justify-center gap-4">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                </svg>
                {t('viewMap')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <SearchFormWrapper />
        </div>
      </div>

      {/* Listings Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyGrid initialProperties={properties} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">{t('footerTitle')}</h3>
              <p className="text-sm">{t('footerDescription')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('propertyTypes')}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t('monthly')}</li>
                <li>{t('weekly')}</li>
                <li>{t('apartment')}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/map" className="hover:text-white transition-colors">
                    {t('viewMap')}
                  </Link>
                </li>
                <li>{t('email')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>{t('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
