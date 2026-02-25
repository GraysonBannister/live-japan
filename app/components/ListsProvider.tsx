'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface List {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items: ListItem[];
}

interface ListItem {
  id: number;
  listId: number;
  propertyId: number;
  notes: string | null;
  createdAt: string;
  property: {
    id: number;
    location: string;
    price: number;
    photos: string[];
    type: string;
    nearestStation: string;
    walkTime: number;
  };
}

interface ListsContextType {
  lists: List[];
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  createList: (name: string, description?: string) => Promise<List | null>;
  updateList: (id: number, name: string, description?: string) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  addToList: (listId: number, property: any, notes?: string) => Promise<void>;
  removeFromList: (listId: number, propertyId: number) => Promise<void>;
  isInList: (propertyId: number) => boolean;
  getListsContainingProperty: (propertyId: number) => number[];
}

const STORAGE_KEY = 'livejapan-lists';

const ListsContext = createContext<ListsContextType | undefined>(undefined);

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY}-${userId}`;
}

function loadLists(userId: string): List[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load lists:', e);
  }
  return [];
}

function saveLists(userId: string, lists: List[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save lists:', e);
  }
}

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchLists = async () => {
    if (!user || !isClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const loaded = loadLists(user.id);
      setLists(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (name: string, description?: string): Promise<List | null> => {
    if (!user || !isClient) return null;
    
    try {
      const newList: List = {
        id: Date.now(),
        userId: user.id,
        name,
        description: description || null,
        isDefault: lists.length === 0, // First list is default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      };
      
      const updatedLists = [newList, ...lists];
      setLists(updatedLists);
      saveLists(user.id, updatedLists);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateList = async (id: number, name: string, description?: string) => {
    if (!user || !isClient) return;
    
    try {
      const updatedLists = lists.map(list => 
        list.id === id 
          ? { ...list, name, description: description || null, updatedAt: new Date().toISOString() }
          : list
      );
      setLists(updatedLists);
      saveLists(user.id, updatedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const deleteList = async (id: number) => {
    if (!user || !isClient) return;
    
    try {
      const updatedLists = lists.filter(list => list.id !== id);
      setLists(updatedLists);
      saveLists(user.id, updatedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const addToList = async (listId: number, property: any, notes?: string) => {
    if (!user || !isClient) return;
    
    try {
      const updatedLists = lists.map(list => {
        if (list.id !== listId) return list;
        
        // Check if already in list
        if (list.items.some(item => item.propertyId === property.id)) {
          return list;
        }
        
        const newItem: ListItem = {
          id: Date.now(),
          listId,
          propertyId: property.id,
          notes: notes || null,
          createdAt: new Date().toISOString(),
          property: {
            id: property.id,
            location: property.location,
            price: property.price,
            photos: property.photos || [],
            type: property.type,
            nearestStation: property.nearestStation,
            walkTime: property.walkTime
          }
        };
        
        return {
          ...list,
          items: [...list.items, newItem],
          updatedAt: new Date().toISOString()
        };
      });
      
      setLists(updatedLists);
      saveLists(user.id, updatedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeFromList = async (listId: number, propertyId: number) => {
    if (!user || !isClient) return;
    
    try {
      const updatedLists = lists.map(list => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.filter(item => item.propertyId !== propertyId),
          updatedAt: new Date().toISOString()
        };
      });
      
      setLists(updatedLists);
      saveLists(user.id, updatedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const isInList = (propertyId: number): boolean => {
    return lists.some(list => 
      list.items.some(item => item.propertyId === propertyId)
    );
  };

  const getListsContainingProperty = (propertyId: number): number[] => {
    return lists
      .filter(list => list.items.some(item => item.propertyId === propertyId))
      .map(list => list.id);
  };

  useEffect(() => {
    if (user && isClient) {
      fetchLists();
    } else {
      setLists([]);
    }
  }, [user, isClient]);

  return (
    <ListsContext.Provider value={{
      lists,
      isLoading,
      error,
      fetchLists,
      createList,
      updateList,
      deleteList,
      addToList,
      removeFromList,
      isInList,
      getListsContainingProperty
    }}>
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}
