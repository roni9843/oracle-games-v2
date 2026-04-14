import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// For admin routes, no key needed (yet)
// For public routes, we might need a key if we test them,
// but for dashboard we primarily use /api/admin/* which are open.

export default api;
