import { create } from 'zustand';
import type { AuthUser } from '@/types';

interface SessionState {
  user: AuthUser | null;
  hasSkippedAuth: boolean;
  authReady: boolean;
  setUser: (user: AuthUser | null) => void;
  skipAuth: () => void;
  markAuthReady: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  hasSkippedAuth: false,
  authReady: false,
  setUser: (user) => set({ user }),
  skipAuth: () => set({ hasSkippedAuth: true }),
  markAuthReady: () => set({ authReady: true }),
  reset: () => set({ user: null, hasSkippedAuth: false }),
}));
