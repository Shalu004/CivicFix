export const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? `${window.location.origin}/api` : 'http://localhost:5000/api');

export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (!BACKEND_URL) return url;
  return `${BACKEND_URL}${url}`;
};
