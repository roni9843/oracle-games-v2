import { create } from 'zustand';
import api from '../lib/axios';

const useGuestStore = create((set, get) => ({
  whatsappNumber: localStorage.getItem('guest_whatsapp') || null,
  telegramId: localStorage.getItem('guest_telegram') || null,
  sessionEndsAt: localStorage.getItem('guest_sessionEndsAt') || null,
  isRestricted: false,
  loading: false,
  error: null,

  // Validate current session against backend
  checkSession: async () => {
    const { whatsappNumber } = get();
    if (!whatsappNumber) return false;

    set({ loading: true, error: null });
    try {
      // Don't need an API key for guests routes usually, but our axios might append it
      const res = await api.get(`/guests/status/${whatsappNumber}`);
      if (res.data.success && res.data.valid) {
        set({
          sessionEndsAt: res.data.sessionEndsAt,
          isRestricted: false,
          loading: false
        });
        localStorage.setItem('guest_sessionEndsAt', res.data.sessionEndsAt);
        return true;
      } else {
        // Expired or restricted
        set({ isRestricted: true, loading: false, error: res.data.message });
        return false;
      }
    } catch (err) {
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Error checking session state',
        isRestricted: true // default to restricted if check fails
      });
      return false;
    }
  },

  // Start new session
  startSession: async (waNum, tgId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/guests/session', {
        whatsappNumber: waNum,
        telegramId: tgId
      });

      if (res.data.success) {
        set({
          whatsappNumber: waNum,
          telegramId: tgId || '',
          sessionEndsAt: res.data.sessionEndsAt,
          isRestricted: false,
          loading: false,
          error: null
        });
        localStorage.setItem('guest_whatsapp', waNum);
        if (tgId) localStorage.setItem('guest_telegram', tgId);
        localStorage.setItem('guest_sessionEndsAt', res.data.sessionEndsAt);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Error starting session' 
      });
      return { success: false, error: err.response?.data?.message };
    }
  },

  clearSession: () => {
    localStorage.removeItem('guest_whatsapp');
    localStorage.removeItem('guest_telegram');
    localStorage.removeItem('guest_sessionEndsAt');
    set({ whatsappNumber: null, telegramId: null, sessionEndsAt: null, isRestricted: false });
  }
}));

export default useGuestStore;
