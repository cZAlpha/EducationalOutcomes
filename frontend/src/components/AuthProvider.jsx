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
         
         // Store tokens securely
         sessionStorage.setItem("access_token", res.data.access);
         sessionStorage.setItem("refresh_token", res.data.refresh);
         
         // Fetch user details
         const userRes = await api.get(`/api/users/${d_number}`, {
            headers: { Authorization: `Bearer ${res.data.access}` }
         });
         
         setUser(userRes.data);
         navigate(userRes.data.role.id === 3 ? "/" : "/"); // Send users to differing routes depending on their role id (unused for now)
      } catch (error) {
         console.error("Login error:", error);
         throw error;
      }
   };
   
   // Function to refresh token
   const refreshToken = async () => {
      try {
         const refresh_token = sessionStorage.getItem("refresh_token");
         if (!refresh_token) return logout();
         
         const res = await api.post("/api/token/refresh/", { refresh: refresh_token });
         sessionStorage.setItem("access_token", res.data.access);
         return res.data.access;
      } catch (error) {
         console.error("Token refresh failed:", error);
         logout();
      }
   };
   
   // Function to log out
   const logout = () => {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      setUser(null);
      navigate("/login");
   };
   
   // Auto-login (Check token on mount)
   useEffect(() => {
      const checkAuth = async () => {
         const token = sessionStorage.getItem("access_token");
         if (!token) return setLoading(false);
         
         try {
            // Assuming you store d_number in sessionStorage when logging in
            const d_number = sessionStorage.getItem("d_number"); // Adjust as needed
            if (!d_number) return setLoading(false);
            
            const userRes = await api.get(`/api/users/${d_number}`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data);
         } catch {
            await refreshToken();
         } finally {
            setLoading(false);
         }
      };
      
      checkAuth();
   }, []);
   
   useEffect(() => {
      setupInterceptors(refreshToken); // ✅ Pass refreshToken to setupInterceptors
   }, []);
   
   
   return (
      <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
         {!loading && children}
      </AuthContext.Provider>
   );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);
