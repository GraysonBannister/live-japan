import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Gallery from '../../components/Gallery';
import MapEmbed from '../../components/MapEmbed';
import PricingCalculator from '../../components/PricingCalculator';
import PropertyTags from '../../components/PropertyTags';
import FreshnessBadge from '../../components/FreshnessBadge';
import PriceDisplay from '../../components/PriceDisplay';
import { getFreshnessInfo, formatConfidenceLevel } from '../../lib/freshness';
import { getPropertyById, getPropertyIds } from '../../lib/supabase-data';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const properties = await getPropertyIds();
  
  return properties.map((property) => ({
    id: property.id.toString(),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(parseInt(id));

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
  const property = await getPropertyById(parseInt(id));

  if (!property) {
    notFound();
  }

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

  const { label, lastUpdatedText, confidenceScore, daysUntilExpiry } = getFreshnessInfo(property);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[#78716C]">
          <Link href="/" className="hover:text-[#3F51B5]">Home / ホーム</Link>
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
            <section className="bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E7E5E4] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-[#3F51B5]/10 text-[#283593] text-sm font-medium rounded-full mb-2">
                    {getTypeLabel(property.type)}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2416]">{property.location}</h1>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-[#D84315]"><PriceDisplay amount={property.price} /></p>
                  <p className="text-[#78716C] text-sm sm:text-base">/ month / 月額</p>
                </div>
              </div>

              {/* Freshness Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <FreshnessBadge property={property} showConfidence={true} showExpiry={true} size="md" />
                </div>
                
                {/* Detailed Freshness Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-200">
                  <div>
                    <span className="block text-gray-400">Last Checked</span>
                    <span className="font-medium">{lastUpdatedText}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Confidence</span>
                    <span className={`font-medium ${
                      confidenceScore >= 70 ? 'text-green-600' :
                      confidenceScore >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {confidenceScore}/100 ({formatConfidenceLevel(confidenceScore)})
                    </span>
                  </div>
                  {daysUntilExpiry !== null && (
                    <div>
                      <span className="block text-gray-400">Listing Expires</span>
                      <span className={`font-medium ${
                        daysUntilExpiry <= 3 ? 'text-red-600' :
                        daysUntilExpiry <= 7 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {daysUntilExpiry === 0 ? 'Today' : `${daysUntilExpiry} days`}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block text-gray-400">Source</span>
                    <span className="font-medium">
                      {property.partnerFeed ? 'Partner Feed' : 'Scraped'}
                    </span>
                  </div>
                </div>
                
                {/* Disclaimer */}
                <p className="mt-3 text-xs text-gray-500 italic">
                  Availability is estimated based on our last update. Please contact us to confirm before making decisions.
                </p>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-[#E7E5E4]">
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-[#78716C] mb-1">Station <span className="hidden sm:inline">/ 最寄駅</span></p>
                  <p className="font-semibold text-[#2C2416] text-sm sm:text-base">{property.nearestStation}</p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-[#78716C] mb-1">Walk <span className="hidden sm:inline">/ 徒歩</span></p>
                  <p className="font-semibold text-[#2C2416] text-sm sm:text-base">{property.walkTime} min <span className="hidden sm:inline">/ 分</span></p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-[#78716C] mb-1">Deposit <span className="hidden sm:inline">/ 敷金</span></p>
                  <p className="font-semibold text-[#2C2416] text-sm sm:text-base">
                    {property.deposit !== null && property.deposit > 0 
                      ? <PriceDisplay amount={property.deposit} />
                      : <span className="text-[#6B8E23]">None<span className="hidden sm:inline"> / なし</span></span>}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-0">
                  <p className="text-xs sm:text-sm text-[#78716C] mb-1">Key Money <span className="hidden sm:inline">/ 礼金</span></p>
                  <p className="font-semibold text-[#2C2416] text-sm sm:text-base">
                    {property.keyMoney !== null && property.keyMoney > 0
                      ? <PriceDisplay amount={property.keyMoney} />
                      : <span className="text-[#6B8E23]">None<span className="hidden sm:inline"> / なし</span></span>}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 pt-4">
                {property.furnished && (
                  <span className="px-4 py-2 bg-[#6B8E23]/10 text-[#4A6318] rounded-full text-sm font-medium">
                    ✓ Furnished / 家具付き
                  </span>
                )}
                {property.foreignerFriendly && (
                  <span className="px-4 py-2 bg-[#3F51B5]/10 text-[#283593] rounded-full text-sm font-medium">
                    ✓ Foreigner OK / 外国人可
                  </span>
                )}
              </div>

              {/* Tags from website */}
              {property.tags && Array.isArray(property.tags) && property.tags.length > 0 && (
                <div className="pt-4 border-t border-[#E7E5E4]">
                  <h3 className="text-sm font-semibold text-[#2C2416] mb-2">Features / 設備・特徴</h3>
                  <PropertyTags tags={property.tags as string[]} />
                </div>
              )}
            </section>

            {/* Description */}
            <section className="bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E7E5E4] p-6">
              <h2 className="text-xl font-bold text-[#2C2416] mb-4">Description / 詳細</h2>
              <div className="space-y-4">
                <p className="text-[#2C2416] leading-relaxed">{property.descriptionEn}</p>
                {property.descriptionJp && (
                  <p className="text-[#78716C] leading-relaxed border-t border-[#E7E5E4] pt-4">
                    {property.descriptionJp}
                  </p>
                )}
              </div>
            </section>

            {/* Map - Moved below description */}
            <section className="bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E7E5E4] p-4 sm:p-6">
              <h2 className="text-xl font-bold text-[#2C2416] mb-4">Location & Nearby / 場所と周辺施設</h2>
              <MapEmbed location={property.location} lat={property.lat} lng={property.lng} />
              <p className="mt-4 text-sm text-[#78716C]">
                <strong className="text-[#2C2416]">{property.location}</strong><br />
                Nearest Station / 最寄駅: {property.nearestStation} ({property.walkTime} min walk / 徒歩{property.walkTime}分)
              </p>
            </section>
          </div>

          {/* Right Column - Pricing, Map and Contact */}
          <div className="space-y-6">
            {/* Pricing Calculator */}
            {property.pricingPlans && Array.isArray(property.pricingPlans) && property.pricingPlans.length > 0 && (
              <PricingCalculator plans={property.pricingPlans as any} />
            )}

            {/* Contact Card */}
            <section className="bg-[#3F51B5] rounded-xl shadow-lg p-4 sm:p-6 text-white sm:sticky sm:top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Interested? <span className="hidden sm:inline">/ お問い合わせ</span></h2>
              <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
                Contact us about this property. Our team speaks English and Japanese.
              </p>
              <button className="w-full py-2.5 sm:py-3 bg-white text-[#3F51B5] font-semibold rounded-lg hover:bg-[#F5F1E8] transition-colors text-sm sm:text-base">
                Request Info <span className="hidden sm:inline">/ 資料請求</span>
              </button>
              <button className="w-full mt-2 sm:mt-3 py-2.5 sm:py-3 bg-[#283593] text-white font-semibold rounded-lg hover:bg-[#1A237E] transition-colors border border-[#5C6BC0] text-sm sm:text-base">
                Schedule Viewing <span className="hidden sm:inline">/ 内見予約</span>
              </button>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70 text-center">
                Reference: #{property.id}
              </p>
              
              {property.sourceUrl && (
                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 sm:mt-4 text-center text-xs sm:text-sm text-white underline hover:text-white/80 transition-colors"
                >
                  View Original Listing / 元の物件ページ →
                </a>
              )}
            </section>

            {/* Relocation Support Promo */}
            <section className="bg-gradient-to-br from-[#6B8E23] to-[#4A6318] rounded-xl shadow-lg p-4 sm:p-6 text-white">
              <h3 className="font-bold mb-2">Need Help Relocating?</h3>
              <p className="text-sm text-white/90 mb-4">
                Our relocation support service helps foreigners find and secure housing in Japan.
              </p>
              <Link 
                href="/relocation"
                className="block w-full text-center py-2 bg-white text-[#6B8E23] font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Learn More
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
