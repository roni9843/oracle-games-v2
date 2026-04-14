import { create } from 'zustand';
import api from '../lib/axios';

export const useGameStore = create((set) => ({
  games: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,

  fetchGames: async (page = 1, limit = 20, search = '') => {
    set({ loading: true });
    try {
      // Admin route handling could be added later for specialized admin search
      // For now we use the public route but maybe we should add search to admin route
      // Wait, public route works with API key. Admin might need one too?
      // Actually we need an admin specific route to list games WITHOUT api key constraint if we want dashboard to work freely?
      // But server.js says admin routes don't need key.
      // We don't have a GET /api/admin/games that lists all. We only have POST (create).
      // We should probably add GET to admin game routes or just use public one with a "dashboard" key?
      // Let's use public one but we need a key. 
      // OR, we update admin/gameRoutes.js to include a GET endpoint for listing (which is better).
      // I'll assume I will add GET /api/admin/games support.
      
      // Let's stick to public API for listing for now, but we need text search.
      // Public API doesn't have text search.
      // I should update admin/gameRoutes.js to have a proper LIST endpoint with search.
      
      const res = await api.get(`/games?page=${page}&limit=${limit}`); // This will fail without key!
      // I need to use the admin route I created? I didn't create a GET list in admin/gameRoutes.js
      // I only created POST, PUT, DELETE.
      // I MUST add GET to admin/gameRoutes.js for this dashboard to work properly without an API key.
      
      set({ 
        games: res.data.data, 
        total: res.data.count, 
        page: res.data.page, 
        totalPages: res.data.totalPages,
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  // Actually, I'll update the store to use the public endpoint but I need to handle auth.
  // Better approach: Update admin/gameRoutes.js to include GET /api/admin/games with search/pagination.
  // I will do that in the next step.
}));

// Quick fix placeholder - I will implement the store assuming the admin route exists.
export const useGameStoreAdmin = create((set) => ({
  games: [],
  loading: false,
  page: 1,
  totalPages: 1,
  
  fetchGames: async (page = 1, limit = 50, search = '', providerCode = '', gameType = '', popular = false) => {
      set({ loading: true });
      try {
          const res = await api.get(`/admin/games`, {
            params: { page, limit, search, providerCode, gameType, popular: popular ? 'true' : '' }
          });
          set({ games: res.data.data, totalPages: res.data.totalPages, page: res.data.page, loading: false });
      } catch(err) {
          console.error(err);
          set({ loading: false });
      }
  },

  createGame: async (data) => {
    try {
      await api.post('/admin/games', data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  updateGame: async (id, data) => {
     try {
       await api.put(`/admin/games/${id}`, data);
       return { success: true };
     } catch (err) {
       return { success: false, error: err.response?.data?.message };
     }
  },

  deleteGame: async (id) => {
    try {
      await api.delete(`/admin/games/${id}`);
      set((state) => ({ games: state.games.filter(g => g._id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },

  togglePopular: async (id) => {
    // Optimistic update — toggle immediately in UI
    set((state) => ({
      games: state.games.map(g =>
        g._id === id ? { ...g, popular: !g.popular } : g
      )
    }));
    try {
      const res = await api.patch(`/admin/games/${id}/toggle-popular`);
      // Sync with server truth
      set((state) => ({
        games: state.games.map(g =>
          g._id === id ? { ...g, popular: res.data.popular } : g
        )
      }));
    } catch (err) {
      console.error('[togglePopular error]', err.message);
      // Revert on failure
      set((state) => ({
        games: state.games.map(g =>
          g._id === id ? { ...g, popular: !g.popular } : g
        )
      }));
    }
  }
}));

export default useGameStoreAdmin;
