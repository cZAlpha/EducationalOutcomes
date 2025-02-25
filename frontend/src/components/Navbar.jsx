import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
   const location = useLocation();
   
   const getActiveStyle = (path) => ({
      backgroundColor: location.pathname === path ? '#f5f5f5' : 'transparent',
      color: location.pathname === path ? 'black' : 'gray',
      '&:hover': {
         color: 'white',
         '& svg': { color: 'white' },
      },
      '& svg': {
         color: location.pathname === path ? 'black' : 'gray',
      },
   });
   
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
   
   useEffect(() => { // Grabs user data on mount
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
               <ListItem button sx={getActiveStyle("/")}> 
                  <ListItemIcon>
                     <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
               </ListItem>
            </Link>
            
            {loggedIn && (
               <>
                  <Link to="/account">
                     <ListItem button sx={getActiveStyle("/account")}>
                        <ListItemIcon>
                           <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText
                           primary={loggedIn ? currentUser?.first_name : "Account"}
                           className="font-bold text-lg"
                        />
                     </ListItem>
                  </Link>
                  <Link to="/courses">
                     <ListItem button sx={getActiveStyle("/courses")}>
                        <ListItemIcon>
                           <ViewAgendaIcon />
                        </ListItemIcon>
                           <ListItemText primary="Courses" />
                        </ListItem>
                  </Link>
                  
                  <Link to="/sections">
                     <ListItem button sx={getActiveStyle("/sections")}>
                        <ListItemIcon>
                           <SubjectIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sections" />
                     </ListItem>
                  </Link>
                  <Link to="/tools">
                     <ListItem button sx={getActiveStyle("/tools")}>
                        <ListItemIcon>
                           <BuildIcon />
                        </ListItemIcon>
                        <ListItemText primary="Tools" />
                     </ListItem>
                  </Link>
               </>
            )}
            
            {loggedIn && (
               <Link to="/logout">
                  <ListItem
                     button
                     sx={{
                        backgroundColor: location.pathname === "/logout" ? '#f5f5f5' : 'transparent',
                        color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Dark red default
                        '&:hover': {
                           color: '#FF0000', // Bright red on hover
                           '& svg': { color: '#FF0000' }, // Icon bright red on hover
                        },
                        '& svg': {
                           color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Match icon to text
                        },
                     }}
                     onClick={()=> {setLoggedIn(false);}}
                  >
                     <ListItemIcon>
                        <ExitToAppIcon />
                     </ListItemIcon>
                     <ListItemText primary="Logout" />
                  </ListItem>
               
               </Link>
            )}
            
            {!loggedIn && (
               <Link to="/login">
                  <ListItem button sx={getActiveStyle("/login")}>
                     <ListItemIcon>
                        <LoginIcon />
                     </ListItemIcon>
                     <ListItemText primary="Login" />
                  </ListItem>
               </Link>
            )}
         </List>
      </Drawer>
   );
};

export default Navbar;
