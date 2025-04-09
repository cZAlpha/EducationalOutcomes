import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SubjectIcon from "@mui/icons-material/Subject"; // Courses
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda"; // Sections
import BuildIcon from "@mui/icons-material/Build";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../components/AuthProvider"; // Import useAuth hook
import { ForkRight } from "@mui/icons-material";


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
   
   const [mobileOpen, setMobileOpen] = useState(false);
   const toggleMobileNav = () => setMobileOpen(!mobileOpen); // Function used to toggle the value of hte mobileOpen variable
   
   const { user, loggedIn, setLoggedIn, logout } = useAuth(); // Use AuthContext
   const [isRootOrAdmin, setIsRootOrAdmin] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   
   const navigate = useNavigate();
   const location = useLocation();
   
   const getActiveStyle = (path) => ({
      backgroundColor: location.pathname === path ? '#f5f5f5' : 'transparent',
      color: location.pathname === path ? 'black' : '#b8b8b8',
      transition: 'color 0.3s ease, background-color 0.3s ease', // Smooth transition
      '&:hover': {
         color: 'white',
         '& svg': { color: 'white' },
      },
      '& svg': {
         color: location.pathname === path ? 'black' : '#b8b8b8',
         transition: 'color 0.3s ease', // Smooth transition for icon color
      },
   });
   
   useEffect(() => {
      // Check if user is logged in and set role on component mount
      if (user && user.role) {
         const userRole = findRoleName(user?.role?.id);
         if (userRole === "root" || userRole === "admin") {
            setIsRootOrAdmin(true);
         }
      }
      setIsLoading(false); // Once loading is done, hide any loading indicators
   }, [user]);
   
   return (
      <>
         {/* Mobile Top Bar */}
         <div className="sm:flex md:hidden w-full top-0 sticky z-10 bg-[#122441] text-white px-4 py-3 flex justify-between items-center">
            <span className="text-lg font-bold">Lumetric</span>
            <IconButton
               onClick={toggleMobileNav}
               className="text-white"
               sx={{
                  '& .MuiSvgIcon-root': {
                        transition: 'color 0.3s ease', // Add transition property
                  },
                  '&:hover .MuiSvgIcon-root': {
                        color: '#3e86c9', // Change to the desired hover color
                  },
               }}
            >
               {mobileOpen ? <CloseIcon className="text-white" /> : <MenuIcon className="text-white" />}
            </IconButton>
         </div>
         {/* Mobile Drawer (Hidden on md and up) */}
         <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            anchor="right"
            sx={{
               display: { xs: "block", md: "none" },
               "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box", backgroundColor: "#122441", color: "white" },
            }}
         >
            <List>
               <ListItem
                  sx={{
                     display: "flex",
                     width: "100%",
                     justifyContent: "flex-end"
                  }}
               >
                  <ListItemText
                     primary={<span className="font-bold text-xl">Menu</span>}
                  />
                  <IconButton
                     onClick={toggleMobileNav}
                     className="text-white"
                     sx={{
                        '& .MuiSvgIcon-root': {
                              transition: 'color 0.3s ease', // Add transition property
                        },
                        '&:hover .MuiSvgIcon-root': {
                              color: 'red', // Change to the desired hover color
                        },
                     }}
                  >
                     <CloseIcon className="text-white" />
                  </IconButton>
               </ListItem>
               <Link to="/">
                  <ListItem button sx={getActiveStyle("/")}> 
                     <ListItemIcon>
                        <HomeIcon />
                     </ListItemIcon>
                     <ListItemText primary="Home" />
                  </ListItem>
               </Link>
               
               {user && (
                  <>
                     <Link to="/account">
                        <ListItem button sx={getActiveStyle("/account")}>
                           <ListItemIcon>
                              <AccountCircleIcon />
                           </ListItemIcon>
                           <ListItemText
                              primary={loggedIn ? user?.first_name : "Account"}
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
               
               {user && (
                  <Link to="/logout">
                     <ListItem
                        button
                        sx={{
                           backgroundColor: location.pathname === "/logout" ? '#f5f5f5' : 'transparent',
                           color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Dark red default
                           transition: 'color 0.3s ease, background-color 0.3s ease', // Smooth transition
                           '&:hover': {
                              color: '#FF0000', // Bright red on hover
                              '& svg': { color: '#FF0000' }, // Icon bright red on hover
                           },
                           '& svg': {
                              color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Match icon to text
                              transition: 'color 0.3s ease', // Smooth transition for icon color
                           },
                        }}
                        onClick={() => { logout(); }} // Use logout from AuthContext
                     >
                        <ListItemIcon>
                           <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                     </ListItem>
                  </Link>
               )}
               
               {!user && (
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
         
         {/* Desktop Drawer (Hidden on sm) */}
         <Drawer
            variant="permanent"
            sx={{
               width: 240,
               flexShrink: 0,
               display: { xs: "none", md: "block" },
               "& .MuiDrawer-paper": { width: 180, boxSizing: "border-box", backgroundColor: "#122441", color: "white" },
            }}
         >
            <List>
               <ListItem>
                  <ListItemText
                     primary={<span className="font-bold text-2xl">Lumetric</span>}
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
               
               {user && (
                  <>
                     <Link to="/account">
                        <ListItem button sx={getActiveStyle("/account")}>
                           <ListItemIcon>
                              <AccountCircleIcon />
                           </ListItemIcon>
                           <ListItemText
                              primary={loggedIn ? user?.first_name : "Account"}
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
               
               {user && (
                  <Link to="/logout">
                     <ListItem
                        button
                        sx={{
                           backgroundColor: location.pathname === "/logout" ? '#f5f5f5' : 'transparent',
                           color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Dark red default
                           transition: 'color 0.3s ease, background-color 0.3s ease', // Smooth transition
                           '&:hover': {
                              color: '#FF0000', // Bright red on hover
                              '& svg': { color: '#FF0000' }, // Icon bright red on hover
                           },
                           '& svg': {
                              color: location.pathname === "/logout" ? '#a10000' : '#a10000', // Match icon to text
                              transition: 'color 0.3s ease', // Smooth transition for icon color
                           },
                        }}
                        onClick={() => { logout(); }} // Use logout from AuthContext
                     >
                        <ListItemIcon>
                           <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                     </ListItem>
                  </Link>
               )}
               
               {!user && (
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
      </>
   );
};

export default Navbar;
