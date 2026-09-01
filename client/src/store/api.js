import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const attachStore = (store) => {
  // Request interceptor
  api.interceptors.request.use((config) => {
    const token = store.getState().auth?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const original = error.config;

      // ❌ Refresh API ya Login API par retry mat karo
      if (
        error.response?.status === 401 &&
        !original._retry &&
        !original.url.includes("/auth/login") &&
        !original.url.includes("/auth/signup") &&
        !original.url.includes("/auth/refresh")
      ) {
        original._retry = true;

        try {
          const { data } = await api.post("/auth/refresh");

          // Guest user hai, refresh mat karo
          if (!data.authenticated || !data.accessToken) {
            store.dispatch({ type: "auth/clear" });
            return Promise.reject(error);
          }

          store.dispatch({
            type: "auth/token",
            payload: data,
          });

          original.headers.Authorization = `Bearer ${data.accessToken}`;

          return api(original);
        } catch {
          store.dispatch({ type: "auth/clear" });
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
};