'use client';

import { useState } from 'react';
import { useCurrency } from './CurrencyProvider';
import { CURRENCY_DETAILS, SupportedCurrency } from '../lib/currency';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  currency?: SupportedCurrency;
}

export interface SearchFilters {
  area: string;
  minPrice: string;
  maxPrice: string;
  type: string;
  maxWalkTime: string;
  furnished: boolean;
  foreignerFriendly: boolean;
  minRooms: string;
  maxRooms: string;
  minSize: string;
  maxSize: string;
  sizeUnit: 'sqm' | 'sqft';
}

interface Region {
  name: string;
  cities: string[];
}

const regions: Region[] = [
  {
    name: 'Tokyo / 東京',
    cities: [
      'All Tokyo',
      'Shibuya', 'Shinjuku', 'Harajuku', 'Roppongi', 'Ginza', 'Akihabara',
      'Ueno', 'Asakusa', 'Ikebukuro', 'Meguro', 'Ebisu', 'Daikanyama',
      'Nakameguro', 'Shimokitazawa', 'Koenji', 'Kichijoji', 'Omotesando',
      'Aoyama', 'Azabu', 'Hiroo', 'Yoyogi', 'Sangenjaya', 'Jiyugaoka',
      'Futako-Tamagawa', 'Kagurazaka', 'Yanaka', 'Nippori', 'Monzen-Nakacho',
      'Tsukiji', 'Toyosu', 'Odaiba', 'Marunouchi', 'Otemachi', 'Toranomon',
      'Shimbashi', 'Hamamatsucho', 'Shinagawa', 'Gotanda', 'Osaki'
    ]
  },
  {
    name: 'Kanagawa / 神奈川',
    cities: ['All Kanagawa', 'Yokohama', 'Kawasaki', 'Yokosuka', 'Kamakura', 'Odawara', 'Sagamihara']
  },
  {
    name: 'Chiba / 千葉',
    cities: ['All Chiba', 'Chiba City', 'Funabashi', 'Matsudo', 'Kashiwa', 'Narita', 'Noda']
  },
  {
    name: 'Saitama / 埼玉',
    cities: ['All Saitama', 'Saitama City', 'Kawaguchi', 'Koshigaya', 'Kawagoe', 'Omiya', 'Kasukabe']
  },
  {
    name: 'Osaka / 大阪',
    cities: ['All Osaka', 'Osaka City', 'Sakai', 'Toyonaka', 'Suita', 'Takatsuki', 'Amagasaki', 'Namba', 'Umeda', 'Shinsaibashi']
  },
  {
    name: 'Kyoto / 京都',
    cities: ['All Kyoto', 'Kyoto City', 'Gion', 'Arashiyama', 'Kinkakuji', 'Gojo', 'Karasuma', 'Shijo']
  },
  {
    name: 'Hyogo / 兵庫',
    cities: ['All Hyogo', 'Kobe', 'Himeji', 'Amagasaki', 'Nishinomiya', 'Ashiya']
  },
  {
    name: 'Aichi / 愛知',
    cities: ['All Aichi', 'Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai']
  },
  {
    name: 'Fukuoka / 福岡',
    cities: ['All Fukuoka', 'Fukuoka City', 'Hakata', 'Tenjin', 'Kurume', 'Kitakyushu']
  },
  {
    name: 'Hokkaido / 北海道',
    cities: ['All Hokkaido', 'Sapporo', 'Hakodate', 'Otaru', 'Asahikawa', 'Furano', 'Niseko']
  },
  {
    name: 'Miyagi / 宮城',
    cities: ['All Miyagi', 'Sendai', 'Ishinomaki', 'Shiogama']
  },
  {
    name: 'Hiroshima / 広島',
    cities: ['All Hiroshima', 'Hiroshima City', 'Fukuyama', 'Kure']
  },
  {
    name: 'Okinawa / 沖縄',
    cities: ['All Okinawa', 'Naha', 'Okinawa City', 'Urasoe', 'Ginowan']
  }
];

const propertyTypes = [
  { value: '', label: 'All Types / すべてのタイプ' },
  { value: 'monthly_mansion', label: 'Monthly Mansion / マンスリーマンション' },
  { value: 'weekly_mansion', label: 'Weekly Mansion / ウィークリーマンション' },
  { value: 'apartment', label: 'Apartment / アパート' }
];

const walkTimeOptions = [
  { value: '', label: 'Any / 指定なし' },
  { value: '5', label: '5 min / 5分以内' },
  { value: '10', label: '10 min / 10分以内' },
  { value: '15', label: '15 min / 15分以内' },
  { value: '20', label: '20 min / 20分以内' }
];

export default function SearchForm({ onSearch, initialFilters, currency: propCurrency }: SearchFormProps) {
  const currencyContext = useCurrency();
  const currency = propCurrency || currencyContext?.currency || 'JPY';
  const currencyDetails = CURRENCY_DETAILS[currency];

  const [filters, setFilters] = useState<SearchFilters>({
    area: initialFilters?.area || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    type: initialFilters?.type || '',
    maxWalkTime: initialFilters?.maxWalkTime || '',
    furnished: initialFilters?.furnished || false,
    foreignerFriendly: initialFilters?.foreignerFriendly || false,
    minRooms: initialFilters?.minRooms || '',
    maxRooms: initialFilters?.maxRooms || '',
    minSize: initialFilters?.minSize || '',
    maxSize: initialFilters?.maxSize || '',
    sizeUnit: initialFilters?.sizeUnit || 'sqm'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Row 1: Location, Type, Price Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Area Select */}
        <div className="space-y-1">
          <label htmlFor="area" className="block text-sm font-medium text-stone-700">
            Area / エリア
          </label>
          <select
            id="area"
            name="area"
            value={filters.area}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800"
          >
            <option value="">All Japan / 全国</option>
            {regions.map(region => (
              <optgroup key={region.name} label={region.name}>
                {region.cities.map(city => (
                  <option key={`${region.name}-${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-stone-700">
            Type / 物件タイプ
          </label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div className="space-y-1">
          <label htmlFor="minPrice" className="block text-sm font-medium text-stone-700">
            Min Price / 最低価格 ({currencyDetails.symbol})
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            placeholder={`e.g., ${currency === 'JPY' ? '80000' : currency === 'USD' ? '500' : '450'}`}
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-stone-800"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-1">
          <label htmlFor="maxPrice" className="block text-sm font-medium text-stone-700">
            Max Price / 最高価格 ({currencyDetails.symbol})
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder={`e.g., ${currency === 'JPY' ? '300000' : currency === 'USD' ? '2000' : '1800'}`}
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-stone-800"
          />
        </div>
      </div>

      {/* Row 2: Rooms, Size, Walk Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {/* Min Rooms */}
        <div className="space-y-1">
          <label htmlFor="minRooms" className="block text-sm font-medium text-stone-700">
            Min Rooms / 最低部屋数
          </label>
          <select
            id="minRooms"
            name="minRooms"
            value={filters.minRooms}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800"
          >
            <option value="">Any / 指定なし</option>
            <option value="1">1 Room (Studio)</option>
            <option value="1.5">1.5 Rooms (1K)</option>
            <option value="2">2 Rooms (1DK/1LDK)</option>
            <option value="2.5">2.5 Rooms</option>
            <option value="3">3 Rooms (2DK/2LDK)</option>
            <option value="4">4+ Rooms</option>
          </select>
        </div>

        {/* Max Rooms */}
        <div className="space-y-1">
          <label htmlFor="maxRooms" className="block text-sm font-medium text-stone-700">
            Max Rooms / 最大部屋数
          </label>
          <select
            id="maxRooms"
            name="maxRooms"
            value={filters.maxRooms}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800"
          >
            <option value="">Any / 指定なし</option>
            <option value="1">1 Room</option>
            <option value="1.5">1.5 Rooms</option>
            <option value="2">2 Rooms</option>
            <option value="2.5">2.5 Rooms</option>
            <option value="3">3 Rooms</option>
            <option value="4">4+ Rooms</option>
          </select>
        </div>

        {/* Min Size */}
        <div className="space-y-1">
          <label htmlFor="minSize" className="block text-sm font-medium text-stone-700">
            Min Size / 最低広さ
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="minSize"
              name="minSize"
              placeholder={filters.sizeUnit === 'sqm' ? 'e.g., 20' : 'e.g., 215'}
              value={filters.minSize}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-stone-800"
            />
            <select
              name="sizeUnit"
              value={filters.sizeUnit}
              onChange={handleChange}
              className="px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800 text-sm"
            >
              <option value="sqm">m²</option>
              <option value="sqft">ft²</option>
            </select>
          </div>
        </div>

        {/* Max Size */}
        <div className="space-y-1">
          <label htmlFor="maxSize" className="block text-sm font-medium text-stone-700">
            Max Size / 最大広さ
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="maxSize"
              name="maxSize"
              placeholder={filters.sizeUnit === 'sqm' ? 'e.g., 80' : 'e.g., 860'}
              value={filters.maxSize}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-stone-800"
            />
            <div className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-600 text-sm">
              {filters.sizeUnit === 'sqm' ? 'm²' : 'ft²'}
            </div>
          </div>
        </div>

        {/* Max Walk Time */}
        <div className="space-y-1">
          <label htmlFor="maxWalkTime" className="block text-sm font-medium text-stone-700">
            Walk Time / 駅までの時間
          </label>
          <select
            id="maxWalkTime"
            name="maxWalkTime"
            value={filters.maxWalkTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white text-stone-800"
          >
            {walkTimeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-8 py-2.5 bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        >
          Search / 検索
        </button>
      </div>
    </form>
  );
}
