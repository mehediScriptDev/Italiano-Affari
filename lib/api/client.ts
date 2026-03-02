import axios from "axios";

export const API_URL = "https://api.psicopatici.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 → attempt token refresh, otherwise redirect to sign-in
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshRes = await api.post("/refresh-token");
        const newToken = refreshRes.data.access_token;
        localStorage.setItem("token", newToken);
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Remove stored auth and notify the app to handle logout client-side.
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        if (typeof window !== "undefined") {
          // Emit a global event so React can perform a client-side redirect using the router
          window.dispatchEvent(new Event("app:logout"));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
