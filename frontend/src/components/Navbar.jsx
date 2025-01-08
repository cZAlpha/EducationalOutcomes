import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'; // For routing with hashes and stuff
import { AppBar, Toolbar, IconButton, Menu, MenuItem } from "@mui/material"; // MUI Imports
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { USER } from "../constants";


const Navbar = () => {
   // START - Role Handling
   const roles = [ // Possible roles for users
      { id: 1, name: 'Root' },
      { id: 2, name: 'Admin' },
      { id: 3, name: 'User' },
   ];

   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unknown Role';
   };
   // STOP - Role Handling

   // State for mobile menu
   const [anchorEl, setAnchorEl] = React.useState(null);
   const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
   
   // State for account dropdown menu
   const [accountMenuAnchorEl, setAccountMenuAnchorEl] = React.useState(null);
   const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
   
   // State for loggedIn status
   const [loggedIn, setLoggedIn] = React.useState(false);
   const [currentUser, setCurrentUser] = useState(null);
   const [isRootOrAdmin, setIsRootOrAdmin] = useState(false); // Variable used to track if the current user is a root or admin user
   const [isLoading, setIsLoading] = useState(true);

   // START - Navigation Section
   const navigate = useNavigate();

   const handleScroll = (id) => {
      const element = document.getElementById(id);
      if (element) {
         element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
         // Navigate to home and allow the effect to occur there
         navigate(`/#${id}`);
      }
   };
   // STOP - Navigation Section
   
   // Handle mobile menu opening
   const handleMobileMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
      setMobileMenuOpen(true);
   };
   
   const handleMobileMenuClose = () => {
      setAnchorEl(null);
      setMobileMenuOpen(false);
   };
   
   // Handle account menu opening
   const handleAccountMenuOpen = (event) => {
      setAccountMenuAnchorEl(event.currentTarget);
      setAccountMenuOpen(true);
   };
   
   const handleAccountMenuClose = () => {
      setAccountMenuAnchorEl(null);
      setAccountMenuOpen(false);
   };
   
   // Fetch user data from localStorage
   const getUserData = () => {
      try {
      const userData = JSON.parse(localStorage.getItem(USER)); // Grabs user object from localstorage
      if (userData && userData.id) {
         setCurrentUser(userData);  // If user exists, set to state
         setLoggedIn(true)
         if (userData.role) { // Set the is root or admin variable
            const userRole = findRoleName(userData.role)
            if (userRole === "Root" || userRole === "Admin") { // If the user is a root or admin user
               setIsRootOrAdmin(true); // Set the is root or admin variable to true
            } 
         }
      } else {
         setCurrentUser(null); // No user found, set as null
      }
      } catch (error) {
      console.error("Navbar Component | Error loading user from localStorage:", error);
      setCurrentUser(null);
      } finally {
      setIsLoading(false); // Finished loading
      }
   };

   // Effect to load user data when the component mounts
   useEffect(() => {
      getUserData();
   }, []);
   
   
   // HTML
   return (
      <AppBar
         position="sticky"
         sx={{
            backgroundColor: 'rgb(28, 76, 113)',
         }}
      >
         <Toolbar className="flex flex-row align-center justify-between md:justify-start gap-x-8">
            {/* Logo */}
            <div className="text-white font-bold text-lg">DSU Educational Outcomes</div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
               <Link to="/">
                  <div className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer flex flex-row items-center gap-x-1">
                     <HomeIcon className="text-inherit" />
                     <p>Home</p>
                  </div>
               </Link>
               <div
                  onClick={() => handleScroll("about")}
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer flex flex-row items-center gap-x-1"
               >
                  <InfoIcon className="text-inherit" />
                  <p>About</p>
               </div>
               <div
                  onClick={() => handleScroll("contact")}
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer flex flex-row items-center gap-x-1"
               >
                  <ContactMailIcon className="text-inherit" />
                  <p className="pl-1">Contact</p>
               </div>
            </div>
            
            {/* Account Icon with Dropdown */}
            <div className="text-white ml-auto">
               {loggedIn && // If the user IS logged in, show dashboard and user info.
               <>
                  <IconButton edge="end" color="inherit" onClick={handleAccountMenuOpen}>
                     <AccountCircleIcon />
                  </IconButton>
                  <Menu
                     anchorEl={accountMenuAnchorEl}
                     open={accountMenuOpen}
                     onClose={handleAccountMenuClose}
                     sx={{
                        '& .MuiPaper-root': {
                           minWidth: '170px', // Adjust this to your desired width
                           maxWidth: '240px', // Optional: Set a max-width
                        },
                     }}
                  >
                     {/* TODO: REPLACE ONCLICK TO ROUTE TO EDIT ACCOUNT PAGE, OR OPEN EDIT USER FORM TO YOUR USER */}
                     <MenuItem 
                        onClick={() => {}} // Update this if you need specific functionality
                        sx={{
                           background: 'transparent',
                           '&:hover': {
                              background: 'transparent',
                           },
                           '&:focus': {
                              background: 'transparent',
                           },
                           '&.Mui-selected': {
                              background: 'transparent',
                              '&:hover': {
                                 background: 'transparent',
                              },
                           },
                        }}
                     > 
                        <div className="flex flex-row items-center justify-center mt-1 mb-2">
                           <AccountCircleIcon style={{ fontSize: 40 }} />
                           <div className="flex flex-col ml-3">
                              <p className="font-bold text-lg">{currentUser?.username ? currentUser.username : "N/A"}</p>
                              <p className="text-gray-400 text-md italic">{findRoleName(currentUser?.role)}</p>
                           </div>
                        </div>
                     </MenuItem>
                     {isRootOrAdmin && // Admin dashboard button
                        <Link to="/dashboard">
                           <MenuItem onClick={handleAccountMenuClose}>
                              <div className="flex flex-row align-center gap-x-2">
                                 <DashboardIcon/> 
                                 <p>Dashboard</p>
                              </div>
                           </MenuItem>
                        </Link>
                     }
                     {!isRootOrAdmin && // User dashboard button
                        <Link to="/userdashboard">
                           <MenuItem onClick={handleAccountMenuClose}>
                              <div className="flex flex-row align-center gap-x-2">
                                 <DashboardIcon/> 
                                 <p>Dashboard</p>
                              </div>
                           </MenuItem>
                        </Link>
                     }
                     <Link to="/logout">
                        <MenuItem onClick={handleAccountMenuClose} >
                           <div className="flex flex-row align-center gap-x-2">
                              <ExitToAppIcon className="text-red-500" /> 
                              <p className="text-red-500">Logout</p>
                           </div>
                        </MenuItem>
                     </Link>
                  </Menu>
               </>
               }
               {!loggedIn && // If the user is NOT logged in, show default
               <>
                  <IconButton edge="end" color="inherit" onClick={handleAccountMenuOpen}>
                     <AccountCircleIcon />
                  </IconButton>
                  <Menu
                     anchorEl={accountMenuAnchorEl}
                     open={accountMenuOpen}
                     onClose={handleAccountMenuClose}
                  >
                     <Link to="/login">
                        <MenuItem onClick={handleAccountMenuClose}>
                           <div className="flex flex-row align-center gap-x-2">
                              <LoginIcon/> 
                              <p>Login</p>
                           </div>
                        </MenuItem>
                     </Link>
                     <Link to="/register">
                        <MenuItem onClick={handleAccountMenuClose}>
                           <div className="flex flex-row align-center gap-x-2">
                              <PersonAddIcon/>
                              <p>Register</p>
                           </div>
                        </MenuItem>
                     </Link>
                  </Menu>
               </>
               }
            </div>
            
            {/* Mobile Menu */}
            <div className="md:hidden">
               <IconButton edge="start" color="inherit" onClick={handleMobileMenuOpen}>
                  <MenuIcon />
               </IconButton>
               <Menu
                  anchorEl={anchorEl}
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuClose}
                  className="md:hidden"
               >
                  <Link to="/">
                     <MenuItem onClick={handleMobileMenuClose}>
                        <HomeIcon className="mr-2" /> Home
                     </MenuItem>
                  </Link>
                  <Link to="/about">
                     <MenuItem onClick={handleMobileMenuClose}>
                        <InfoIcon className="mr-2" /> About
                     </MenuItem>
                  </Link>
                  <Link to="/contact">
                     <MenuItem onClick={handleMobileMenuClose}>
                        <ContactMailIcon className="mr-2" /> Contact
                     </MenuItem>
                  </Link>
               </Menu>
            </div>
         </Toolbar>
      </AppBar>
   );
};

export default Navbar;
