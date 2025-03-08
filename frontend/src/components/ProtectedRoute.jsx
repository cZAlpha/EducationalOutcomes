import { Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthProvider"; // Use AuthContext, not AuthProvider

function ProtectedRoute({ children }) {
   const { user } = useContext(AuthContext); // Access user from AuthContext
   const [isAuthorized, setIsAuthorized] = useState(null);

   useEffect(() => {
      // Check if user exists in context
      if (user) {
         setIsAuthorized(true); // User is authenticated
      } else {
         setIsAuthorized(false); // No user found, unauthorized
      }
   }, [user]);

   if (isAuthorized === null) {
      return <div>Loading...</div>; // Wait for user state to be determined
   }

   return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
