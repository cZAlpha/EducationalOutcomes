import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // For routing with hashes and stuff

// Tailwind Imports
import '../index.css';

// Constants
import { USER } from "../constants";


function UserDashboard() {
   // START - User Role Ascertation Code
   const roles = [ // Possible roles for users
      { id: 1, name: 'root' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'user' },
   ];

   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unassigned';
   };
   // STOP - User Role Ascertation Code

   // Navigation 
   const navigate = useNavigate();
   
   // User States (NOT FOR THE USER FORM)
   const [isLoadingUser, setIsLoadingUser] = useState(true); // New loading state for current user
   const [currentUser, setCurrentUser] = useState(null); // Handles current user

   const getCurrentUser = () => {
      try {
         const user = JSON.parse(localStorage.getItem(USER)); // Parse the JSON string
         if (user) {
            setCurrentUser(user); // Update state with the username
         } else {
            setCurrentUser(null);
         }
      } catch (error) {
         console.error("Error parsing localStorage USER value:", error);
         setCurrentUser(null);
      } finally {
         setIsLoadingUser(false); // Loading complete
      }
   };

   // Effect to fetch data
   useEffect(() => {
      getCurrentUser(); // Gets the current user
   }, []);

   // Waits until user is being loaded from local storage, and then boots current user out if they aren't signed in and somehow got to the dashboard route
   useEffect(() => {
      if (isLoadingUser) return; // Wait until user loading completes
   
      //console.log("DASHBOARD | Current user state updated to: ", currentUser);
      if (currentUser === null) {
         console.log("No user, current user == ", currentUser);
         navigate(`/login`); // Redirect to login page
      }
   }, [currentUser, isLoadingUser]);
   
   // HTML
   return (
      <> {/* Singular parent element required by React */}
         <Navbar />
         <div className="flex flex-col items-center justify-center w-full text-center space-y-12">
            <h1 className="pt-12 pb-8 text-white text-3xl font-bold min-h-[60vh]">User Dashboard Placeholder :)</h1>
         </div>
      </>
   );
}

export default UserDashboard;