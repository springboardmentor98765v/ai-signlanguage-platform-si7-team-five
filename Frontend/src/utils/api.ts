// Docker maps the backend to 8002 locally to avoid clashing with an existing
// host service on port 8000. Production supplies VITE_BACKEND_URL instead.
export const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8002';
export const aiApiBaseUrl = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8001';
