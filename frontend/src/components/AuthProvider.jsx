import { createContext, useContext, useState, useEffect } from "react";
import api, { setupInterceptors } from "../api";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
   
   // Function to handle login
   const login = async (d_number, password) => {
      try {
         const res = await api.post("/api/token/", { d_number, password });
         
         // Store tokens and user identifier persistently
         localStorage.setItem("access_token", res.data.access);
         localStorage.setItem("refresh_token", res.data.refresh);
         localStorage.setItem("d_number", d_number);
         
         // Fetch user details
         const userRes = await api.get(`/api/users/${d_number}`, {
            headers: { Authorization: `Bearer ${res.data.access}` }
         });
         
         setUser(userRes.data);
      } catch (error) {
         console.error("Login error:", error);
         throw error;
      }
   };
   
   // Function to refresh token
   const refreshToken = async () => {
      try {
         const refresh_token = localStorage.getItem("refresh_token");
         if (!refresh_token) return logout();
         
         const res = await api.post("/api/token/refresh/", { refresh: refresh_token });
         localStorage.setItem("access_token", res.data.access);
         return res.data.access;
      } catch (error) {
         console.error("Token refresh failed:", error);
         logout();
      }
   };
   
   // Function to log out
   const logout = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("d_number");
      setUser(null);
      navigate("/login");
   };
   
   // Auto-login (Check token on mount)
   useEffect(() => {
      const checkAuth = async () => {
         const token = localStorage.getItem("access_token");
         if (!token) {
            setLoading(false);
            return;
         }
         
         try {
            const d_number = localStorage.getItem("d_number");
            if (!d_number) {
               setLoading(false);
               return;
            }
            
            const userRes = await api.get(`/api/users/${d_number}`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data);
         } catch (error) {
            // If token is expired, try to refresh it
            try {
               const newToken = await refreshToken();
               if (newToken) {
                  const d_number = localStorage.getItem("d_number");
                  const userRes = await api.get(`/api/users/${d_number}`, {
                     headers: { Authorization: `Bearer ${newToken}` }
                  });
                  setUser(userRes.data);
               }
            } catch (refreshError) {
               console.error("Auto-login failed:", refreshError);
               logout();
            }
         } finally {
            setLoading(false);
         }
      };
      
      checkAuth();
   }, []);
   
   // In your first provider, modify the useEffect for interceptors:
   useEffect(() => {
      if (!loading) {  // Only setup interceptors after initial auth check
      setupInterceptors(refreshToken);
      }
   }, [loading]);
   
   return (
      <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
         {!loading && children}
      </AuthContext.Provider>
   );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);