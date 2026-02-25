'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useLists } from './ListsProvider';

interface SaveToListButtonProps {
  propertyId: number;
  property?: {
    id: number;
    location: string;
    price: number;
    photos?: string[];
    type?: string;
    nearestStation?: string;
    walkTime?: number;
  };
  variant?: 'icon' | 'button';
}

export default function SaveToListButton({ propertyId, property, variant = 'icon' }: SaveToListButtonProps) {
  const { user } = useAuth();
  const { lists, isLoading, addToList, removeFromList, getListsContainingProperty, createList, fetchLists } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const containingLists = getListsContainingProperty(propertyId);
  const isSaved = containingLists.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewListName('');
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleList = async (listId: number) => {
    if (containingLists.includes(listId)) {
      await removeFromList(listId, propertyId);
    } else if (property) {
      await addToList(listId, property);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !property) return;
    
    const newList = await createList(newListName.trim());
    if (newList) {
      await addToList(newList.id, property);
      setIsCreating(false);
      setNewListName('');
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/auth'}
        className={`${variant === 'icon' 
          ? 'p-2 rounded-full hover:bg-gray-100 transition-colors' 
          : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
        }`}
        title="Sign in to save"
      >
        {variant === 'icon' ? (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ) : (
          'Save / 保存'
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${variant === 'icon'
          ? `p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`
          : `px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isSaved ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
        }`}
        title={isSaved ? `Saved to ${containingLists.length} list${containingLists.length > 1 ? 's' : ''}` : 'Save to list'}
      >
        {variant === 'icon' ? (
          <svg 
            className="w-5 h-5" 
            fill={isSaved ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ) : (
          isSaved ? `Saved (${containingLists.length}) / 保存済` : 'Save / 保存'
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Save to List / リストに保存</p>
          </div>

          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : lists.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No lists yet</div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleToggleList(list.id)}
                  className="w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate">{list.name}</span>
                  {containingLists.includes(list.id) && (
                    <svg className="w-4 h-4 text-[#3F51B5] flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2 text-left text-sm text-[#3F51B5] hover:bg-[#3F51B5]/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New List / 新規リスト
              </button>
            ) : (
              <form onSubmit={handleCreateList} className="px-4 py-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name / リスト名"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5]"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={!newListName.trim()}
                    className="flex-1 px-3 py-1.5 bg-[#3F51B5] text-white text-xs font-medium rounded hover:bg-[#283593] transition-colors disabled:opacity-50"
                  >
                    Create / 作成
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewListName('');
                    }}
                    className="px-3 py-1.5 text-gray-600 text-xs hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
