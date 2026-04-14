import { create } from 'zustand';
import api from '../lib/axios';

export const useProviderStore = create((set) => ({
  providers: [],
  loading: false,
  
  fetchProviders: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/providers');
      set({ providers: res.data.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createProvider: async (data) => {
    try {
      const res = await api.post('/admin/providers', data);
      set((state) => ({ providers: [...state.providers, res.data.data] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  updateProvider: async (id, data) => {
    try {
      const res = await api.put(`/admin/providers/${id}`, data);
      set((state) => ({
        providers: state.providers.map(p => p._id === id ? res.data.data : p)
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  },

  deleteProvider: async (id) => {
    try {
      await api.delete(`/admin/providers/${id}`);
      set((state) => ({ providers: state.providers.filter(p => p._id !== id) }));
    } catch (err) {
      console.error(err);
    }
  }
}));

export default useProviderStore;
