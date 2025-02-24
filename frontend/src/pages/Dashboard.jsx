// React Imports
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // For routing with hashes and stuff

// Tailwind Imports
import '../index.css';

// Constants
import { USER } from "../constants";

// MUI Icon Imports
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ListIcon from "@mui/icons-material/List";
   // Misc. MUI Import(s)
import Tooltip from '@mui/material/Tooltip';

// Misc. Component Import(s)
import Navbar from "../components/Navbar";

// Section Components Imports
import UsersSection from "../components/UsersSection";
import LogsSection from '../components/LogsSection';


function Dashboard() {
   // START - User Role Ascertation Code
   const roles = [
      { id: 1, name: 'user' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'root' },
   ];
   
   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unassigned';  // ✔️ Changed to role.name
   };   
   // STOP - User Role Ascertation Code

   // Navigation 
   const navigate = useNavigate();
   
   // User States (NOT FOR THE USER FORM)
   const [isLoadingUser, setIsLoadingUser] = useState(true); // New loading state for current user
   const [currentUser, setCurrentUser] = useState(null); // Handles current user

   // Currently selected state variables for each navbar section
   const [selectedSection, setSelectedSection] = useState("users"); // Default selected section (Analytics)

   const getCurrentUser = () => {
      try {
         const user = JSON.parse(localStorage.getItem(USER)); // Parse the JSON string
         //console.log("DASHBOARD | user is now: ", user);
         if (user) {
            setCurrentUser(user); // Update state with the username
            if (user.role) { // User role ascertation to handle not allowing regular users into the admin dashboard
               const userRole = findRoleName(user?.role?.id);  // Pass the role ID
               if (userRole !== "admin" && userRole !== "root") { // If the user is NOT an admin or root user, navigate to the user dashboard
                  useNavigate("/userdashboard");
               }
            }
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
   
   
   return (
      <>
         <Navbar/>
         <div className="bg-transparent min-h-screen p-2"> {/* Page Background*/}
            {/* Navigation Section */}
            <nav className="flex justify-start p-4">
               <h1 className="text-white text-2xl font-bold">
                  {currentUser?.username ? `Welcome, ${currentUser.username}` : ""}
               </h1>
            </nav>
            
            <div className="flex flex-row gap-4 justify-start p-4">
               {/* Flex Row/Col for all Icons*/}
               <div className="flex flex-row md:flex-col gap-6 p-4 border-[#1c4c71] border-2 rounded-lg bg-white shadow-lg h-full items-center overflow-hidden">
                  <Tooltip title="Users" arrow popper={{ modifiers: [{ name: 'flip', enabled: false }] }} placement="right">
                     <AccountCircleIcon // Users icon
                        onClick={() => setSelectedSection("users")} 
                        className="text-[#1c4c71] transition-all duration-300 transform hover:text-[#419cd6] hover:scale-110" 
                     />
                  </Tooltip>
                  <Tooltip title="Logs" arrow popper={{ modifiers: [{ name: 'flip', enabled: false }] }} placement="right">
                     <ListIcon // Logs icon
                        onClick={() => setSelectedSection("logs")} 
                        className="text-[#1c4c71] transition-all duration-300 transform hover:text-[#419cd6] hover:scale-110" 
                     />
                  </Tooltip>
               </div>
               {/* Content */}
               <div className="w-full bg-blue-400/60 backdrop-blur-md border border-blue-800/60 rounded-lg shadow-lg p-4">
                  {selectedSection === "users" && <UsersSection currentUser={currentUser} />} 
                  {selectedSection === "logs" && <LogsSection currentUser={currentUser} />}
               </div>
            </div>
         </div>
      </>
   );
}

export default Dashboard;
