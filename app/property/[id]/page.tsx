import { prisma } from '../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Gallery from '../../components/Gallery';
import MapEmbed from '../../components/MapEmbed';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const properties = await prisma.property.findMany({
    select: { id: true }
  });
  
  return properties.map((property) => ({
    id: property.id.toString(),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) }
  });

  if (!property) {
    return { title: 'Property Not Found | Live Japan' };
  }

  return {
    title: `${property.location} - ${property.price.toLocaleString()}¥/month | Live Japan`,
    description: property.descriptionEn,
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) }
  });

  if (!property) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly_mansion':
        return 'Monthly Mansion / マンスリーマンション';
      case 'weekly_mansion':
        return 'Weekly Mansion / ウィークリーマンション';
      case 'apartment':
        return 'Apartment / アパート';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            ← Live Japan
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm text-gray-600">
            <span>English</span>
            <span>/</span>
            <span className="text-gray-400">日本語</span>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home / ホーム</Link>
          <span className="mx-2">›</span>
          <span>{property.location}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <section>
              <Gallery photos={property.photos as string[]} location={property.location} />
            </section>

            {/* Property Details */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                    {getTypeLabel(property.type)}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.location}</h1>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formatPrice(property.price)}</p>
                  <p className="text-gray-500 text-sm sm:text-base">/ month / 月額</p>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-gray-100">
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Station <span className="hidden sm:inline">/ 最寄駅</span></p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{property.nearestStation}</p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Walk <span className="hidden sm:inline">/ 徒歩</span></p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{property.walkTime} min <span className="hidden sm:inline">/ 分</span></p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Deposit <span className="hidden sm:inline">/ 敷金</span></p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {property.deposit !== null && property.deposit > 0 
                      ? formatPrice(property.deposit)
                      : <span className="text-green-600">None<span className="hidden sm:inline"> / なし</span></span>}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Key Money <span className="hidden sm:inline">/ 礼金</span></p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {property.keyMoney !== null && property.keyMoney > 0
                      ? formatPrice(property.keyMoney)
                      : <span className="text-green-600">None<span className="hidden sm:inline"> / なし</span></span>}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 pt-4">
                {property.furnished && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ Furnished / 家具付き
                  </span>
                )}
                {property.foreignerFriendly && (
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    ✓ Foreigner OK / 外国人可
                  </span>
                )}
              </div>
            </section>

            {/* Description */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description / 詳細</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{property.descriptionEn}</p>
                {property.descriptionJp && (
                  <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {property.descriptionJp}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Map and Contact */}
          <div className="space-y-6">
            {/* Map */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Location / 場所</h2>
              <MapEmbed location={property.location} />
              <p className="mt-3 text-sm text-gray-600">
                <strong>{property.location}</strong><br />
                Nearest: {property.nearestStation} ({property.walkTime} min walk)
              </p>
            </section>

            {/* Contact Card */}
            <section className="bg-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white sm:sticky sm:top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Interested? <span className="hidden sm:inline">/ お問い合わせ</span></h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                Contact us about this property. Our team speaks English and Japanese.
              </p>
              <button className="w-full py-2.5 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base">
                Request Info <span className="hidden sm:inline">/ 資料請求</span>
              </button>
              <button className="w-full mt-2 sm:mt-3 py-2.5 sm:py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border border-blue-500 text-sm sm:text-base">
                Schedule Viewing <span className="hidden sm:inline">/ 内見予約</span>
              </button>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-200 text-center">
                Reference: #{property.id}
              </p>
              
              {property.sourceUrl && (
                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 sm:mt-4 text-center text-xs sm:text-sm text-white underline hover:text-blue-100 transition-colors"
                >
                  View Original Listing / 元の物件ページ →
                </a>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
