'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useLists } from '../components/ListsProvider';
import { useCurrency } from '../components/CurrencyProvider';
import PropertyCard from '../components/PropertyCard';
import Header from '../components/Header';
import Link from 'next/link';

export default function ListsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { lists, isLoading: listsLoading, fetchLists, deleteList, removeFromList } = useLists();
  const currencyContext = useCurrency();
  
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const selectedList = lists.find(list => list.id === selectedListId);

  if (authLoading || listsLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2416]">My Lists / マイリスト</h1>
          <p className="text-[#78716C] mt-1">Save and organize your favorite properties</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lists */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E7E5E4] bg-[#F5F1E8]">
                <h2 className="font-semibold text-[#2C2416]">Your Lists / リスト</h2>
              </div>
              
              {lists.length === 0 ? (
                <div className="p-4 text-sm text-[#78716C]">
                  No lists yet. Save properties to create lists.
                </div>
              ) : (
                <div className="divide-y divide-[#E7E5E4]">
                  {lists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id === selectedListId ? null : list.id)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                        selectedListId === list.id 
                          ? 'bg-[#3F51B5]/10 text-[#3F51B5]' 
                          : 'hover:bg-[#F5F1E8]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{list.name}</p>
                        <p className="text-xs text-[#78716C]">{list.items?.length || 0} properties</p>
                      </div>
                      {list.isDefault && (
                        <span className="text-xs bg-[#6B8E23]/10 text-[#4A6318] px-2 py-0.5 rounded ml-2">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link 
              href="/"
              className="mt-4 block w-full py-2.5 bg-[#3F51B5] text-white text-center font-medium rounded-lg hover:bg-[#283593] transition-colors"
            >
              Browse Properties / 物件を探す
            </Link>
          </div>

          {/* Main Content - Properties */}
          <div className="lg:col-span-3">
            {!selectedList ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-[#2C2416] mb-2">Select a List</h2>
                <p className="text-[#78716C]">Choose a list from the sidebar to view saved properties</p>
              </div>
            ) : selectedList.items?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#E7E5E4] p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h2 className="text-xl font-semibold text-[#2C2416] mb-2">No Properties Yet</h2>
                <p className="text-[#78716C] mb-6">This list is empty. Start saving properties you like.</p>
                <Link 
                  href="/"
                  className="inline-block px-6 py-2.5 bg-[#3F51B5] text-white font-medium rounded-lg hover:bg-[#283593] transition-colors"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div>
                {/* List Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#2C2416]">{selectedList.name}</h2>
                    <p className="text-[#78716C]">
                      {selectedList.items?.length} property{selectedList.items?.length !== 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteList(selectedList.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete List
                  </button>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {selectedList.items?.map((item) => (
                    <div key={item.id} className="relative group">
                      <PropertyCard property={{
                        id: item.property.id,
                        externalId: null,
                        sourceUrl: null,
                        location: item.property.location,
                        price: item.property.price,
                        photos: item.property.photos,
                        type: item.property.type,
                        nearestStation: item.property.nearestStation,
                        walkTime: item.property.walkTime,
                        furnished: false,
                        foreignerFriendly: false,
                        rooms: null,
                        sizeSqm: null,
                        descriptionEn: '',
                        descriptionJp: null,
                        deposit: null,
                        keyMoney: null,
                        lat: null,
                        lng: null,
                        availableFrom: null,
                        updatedAt: new Date(),
                        createdAt: new Date(),
                        pricingPlans: null,
                        tags: null,
                        lastScrapedAt: null,
                        lastConfirmedAvailableAt: null,
                        sourceLastUpdatedAt: null,
                        statusConfidenceScore: 50,
                        availabilityStatus: 'unknown',
                        contentHash: null,
                        lastContentChangeAt: null,
                        autoHideAfter: null,
                        isActive: true,
                        partnerFeed: false,
                        verificationStatus: 'unverified',
                        clickCount: 0,
                        inquiryCount: 0,
                        lastInquiryAt: null,
                      }} />
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromList(selectedList.id, item.property.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        title="Remove from list"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Notes */}
                      {item.notes && (
                        <div className="mt-2 p-2 bg-[#F5F1E8] rounded text-sm text-[#2C2416]">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
