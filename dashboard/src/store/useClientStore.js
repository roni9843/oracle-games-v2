import { create } from 'zustand';
import api from '../lib/axios';

export const useClientStore = create((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/clients');
      set({ clients: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createClient: async (data) => {
    try {
      const res = await api.post('/admin/clients', data);
      set((state) => ({ clients: [res.data.data, ...state.clients] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  deleteClient: async (id) => {
    try {
      await api.delete(`/admin/clients/${id}`);
      set((state) => ({ clients: state.clients.filter((c) => c._id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },

  regenerateKey: async (id) => {
    try {
      const res = await api.post(`/admin/clients/${id}/regenerate`);
      set((state) => ({
        clients: state.clients.map((c) => (c._id === id ? res.data.data : c)),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  toggleClient: async (id, isEnabled) => {
    try {
      const res = await api.put(`/admin/clients/${id}`, { isEnabled });
      set((state) => ({
        clients: state.clients.map((c) => (c._id === id ? res.data.data : c)),
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));
