import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactMailIcon from "@mui/icons-material/ContactMail";
import SubjectIcon from "@mui/icons-material/Subject"; // Courses
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda"; // Sections
import BuildIcon from "@mui/icons-material/Build";
import { USER } from "../constants";

const Navbar = () => {
   const roles = [
      { id: 1, name: 'user' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'root' },
   ];
   
   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unassigned';
   };
   
   const [loggedIn, setLoggedIn] = useState(false);
   const [currentUser, setCurrentUser] = useState(null);
   const [isRootOrAdmin, setIsRootOrAdmin] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   const navigate = useNavigate();

   const handleScroll = (id) => {
      const element = document.getElementById(id);
      if (element) {
         element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
         navigate(`/#${id}`);
      }
   };

   const getUserData = () => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         if (userData) {
            setCurrentUser(userData);
            setLoggedIn(true);
            if (userData.role) {
               const userRole = findRoleName(userData?.role?.id);
               if (userRole === "root" || userRole === "admin") {
                  setIsRootOrAdmin(true);
               } 
            }
         } else {
            setCurrentUser(null);
         }
      } catch (error) {
         console.error("Navbar Component | Error loading user from localStorage:", error);
         setCurrentUser(null);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      getUserData();
   }, []);
   
   return (
      <Drawer
         variant="permanent"
         sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: '#122441', color: 'white' },
         }}
      >
         <List>
            <ListItem>
               <ListItemText
                  primary={<span className="font-bold text-2xl">DSU Educational Outcomes</span>}
               />
            </ListItem>
            <Link to="/">
               <ListItem button>
                  <ListItemIcon><HomeIcon className="text-white" /></ListItemIcon>
                  <ListItemText primary="Home" />
               </ListItem>
            </Link>

            {loggedIn && ( // Only show application page options if logged in
               <>
                  <Link to="/account">
                     <ListItem>
                        <ListItemIcon>
                           <AccountCircleIcon className="text-white" />
                        </ListItemIcon>
                        <ListItemText
                           primary={loggedIn ? currentUser?.first_name : "Account"}
                           className="font-bold text-lg"
                        />
                     </ListItem>
                  </Link>
                  <Link to="/courses">
                     <ListItem button>
                        <ListItemIcon><ViewAgendaIcon className="text-white" /></ListItemIcon>
                        <ListItemText primary="Courses" />
                     </ListItem>
                  </Link>
                  <Link to="/sections">
                     <ListItem button>
                        <ListItemIcon><SubjectIcon className="text-white" /></ListItemIcon>
                        <ListItemText primary="Sections" />
                     </ListItem>
                  </Link>
                  <Link to="/tools">
                     <ListItem button>
                        <ListItemIcon><BuildIcon className="text-white" /></ListItemIcon>
                        <ListItemText primary="Tools" />
                     </ListItem>
                  </Link>
               </>
            )}

            
            
            {loggedIn && ( // If logged in
               <Link to="/logout">
                  <ListItem button>
                     <ListItemIcon><ExitToAppIcon className="text-red-500" /></ListItemIcon>
                     <ListItemText primary="Logout" className="text-red-500" />
                  </ListItem>
               </Link>
            )}
            {!loggedIn && ( // IF NOT LOGGED IN
               <Link to="/login">
                  <ListItem button>
                     <ListItemIcon><LoginIcon className="text-white" /></ListItemIcon>
                     <ListItemText primary="Login" />
                  </ListItem>
               </Link>
            )}
         </List>
      </Drawer>
   );
};

export default Navbar;
