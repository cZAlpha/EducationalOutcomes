import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/";

const api = axios.create({
   baseURL: apiUrl,
   headers: { "Content-Type": "application/json" },
});

// Function to attach refresh logic
export const setupInterceptors = (refreshToken) => {
   // Request Interceptor to Attach Access Token
   api.interceptors.request.use(
      async (config) => {
         let token = sessionStorage.getItem("access_token");

         if (!token) {
            token = await refreshToken(); // Call refreshToken passed from AuthProvider
         }

         if (token) {
            config.headers.Authorization = `Bearer ${token}`;
         }

         return config;
      },
      (error) => Promise.reject(error)
   );

   // Response Interceptor to Handle Token Expiration
   api.interceptors.response.use(
      (response) => response,
      async (error) => {
         const originalRequest = error.config;

         // If the request fails with 401 Unauthorized, try refreshing the token once
         if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await refreshToken();

            if (newToken) {
               originalRequest.headers.Authorization = `Bearer ${newToken}`;
               return api(originalRequest);
            }
         }

         return Promise.reject(error);
      }
   );
};

export default api;
