'use client';

import { ViewMode } from '../types/property';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  propertyCount: number;
}

export default function ViewToggle({ currentView, onViewChange, propertyCount }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-[#78716C] text-sm hidden sm:block">
        {propertyCount} {propertyCount === 1 ? 'property' : 'properties'} found
      </div>
      <div className="flex bg-[#F5F1E8] rounded-lg p-1">
        <button
          onClick={() => onViewChange('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            currentView === 'grid'
              ? 'bg-[#FDFBF7] text-[#3F51B5] shadow-sm'
              : 'text-[#78716C] hover:text-[#2C2416]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Grid
        </button>
        <button
          onClick={() => onViewChange('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            currentView === 'map'
              ? 'bg-[#FDFBF7] text-[#3F51B5] shadow-sm'
              : 'text-[#78716C] hover:text-[#2C2416]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
          </svg>
          Map
        </button>
      </div>
    </div>
  );
}
