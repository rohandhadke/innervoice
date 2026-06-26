import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      logout: () => set({ user: null, token: null, refreshToken: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'innervoice-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
