'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  area: string;
  minPrice: string;
  maxPrice: string;
  type: string;
  maxWalkTime: string;
  furnished: boolean;
  foreignerFriendly: boolean;
}

const areas = [
  'All Areas',
  'Shibuya', 'Shinjuku', 'Harajuku', 'Roppongi', 'Ginza', 'Akihabara',
  'Ueno', 'Asakusa', 'Ikebukuro', 'Meguro', 'Ebisu', 'Daikanyama',
  'Nakameguro', 'Shimokitazawa', 'Koenji', 'Kichijoji', 'Omotesando',
  'Aoyama', 'Azabu', 'Hiroo', 'Yoyogi', 'Sangenjaya', 'Jiyugaoka',
  'Futako-Tamagawa', 'Kagurazaka', 'Yanaka', 'Nippori', 'Monzen-Nakacho',
  'Tsukiji', 'Toyosu', 'Odaiba', 'Marunouchi', 'Otemachi', 'Toranomon',
  'Shimbashi', 'Hamamatsucho', 'Shinagawa', 'Gotanda', 'Osaki'
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

export default function SearchForm({ onSearch, initialFilters }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    area: initialFilters?.area || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    type: initialFilters?.type || '',
    maxWalkTime: initialFilters?.maxWalkTime || '',
    furnished: initialFilters?.furnished || false,
    foreignerFriendly: initialFilters?.foreignerFriendly || false
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Area Select */}
        <div className="space-y-1">
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Area / エリア
          </label>
          <select
            id="area"
            name="area"
            value={filters.area}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {areas.map(area => (
              <option key={area} value={area === 'All Areas' ? '' : area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type / 物件タイプ
          </label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
            Min Price / 最低価格 (¥)
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            placeholder="e.g., 80000"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-1">
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
            Max Price / 最高価格 (¥)
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder="e.g., 300000"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Walk Time */}
        <div className="space-y-1">
          <label htmlFor="maxWalkTime" className="block text-sm font-medium text-gray-700">
            Walk Time / 駅までの時間
          </label>
          <select
            id="maxWalkTime"
            name="maxWalkTime"
            value={filters.maxWalkTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {walkTimeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 flex flex-col justify-center lg:col-span-1 md:col-span-2">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="furnished"
                checked={filters.furnished}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Furnished <span className="hidden sm:inline">/ 家具付き</span>
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="foreignerFriendly"
                checked={filters.foreignerFriendly}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Foreigner OK <span className="hidden sm:inline">/ 外国人可</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search / 検索
        </button>
      </div>
    </form>
  );
}
