import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile, Toilet, FilterType } from '../types';

interface AppState {
  user: Profile | null;
  session: Session | null;
  toilets: Toilet[];
  nearbyToilets: Toilet[];
  activeFilter: FilterType;
  savedToiletIds: string[];
  setUser: (user: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setToilets: (toilets: Toilet[]) => void;
  setNearbyToilets: (toilets: Toilet[]) => void;
  setFilter: (filter: FilterType) => void;
  toggleSaved: (toiletId: string) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  session: null,
  toilets: [],
  nearbyToilets: [],
  activeFilter: 'all',
  savedToiletIds: [],
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setToilets: (toilets) => set({ toilets }),
  setNearbyToilets: (nearbyToilets) => set({ nearbyToilets }),
  setFilter: (activeFilter) => set({ activeFilter }),
  toggleSaved: (toiletId) =>
    set((state) => ({
      savedToiletIds: state.savedToiletIds.includes(toiletId)
        ? state.savedToiletIds.filter((id) => id !== toiletId)
        : [...state.savedToiletIds, toiletId],
    })),
  clearAuth: () =>
    set({
      user: null,
      session: null,
      toilets: [],
      nearbyToilets: [],
      savedToiletIds: [],
      activeFilter: 'all',
    }),
}));
