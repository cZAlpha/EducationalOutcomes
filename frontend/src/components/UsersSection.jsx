import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshButton from './RefreshButton';
import { ArrowBack, ArrowForward } from '@mui/icons-material'; // Import MUI icons
import api from '../api';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


const UsersSection = ( currentUser ) => {
   // START - User Role Ascertation Code
   const roles = [ // Possible roles for users
      { id: 1, name: 'root' },
      { id: 2, name: 'Admin' },
      { id: 3, name: 'User' },
   ];

   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unassigned';
   };
   // STOP - User Role Ascertation Code

   // START - Page Handling Variables
   const [users, setUsers] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const usersPerPage = 5;
   const totalPages = Math.ceil(users.length / usersPerPage);
   // STOP - Page Handling Variables

   // START - Confirming Deletion
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [userToDelete, setUserToDelete] = useState(null);
   
   // Handle User Delete Confirmation
   const handleUserDeleteConfirmation = (user) => {
      setUserToDelete(user); // Save the user to be deleted
      setShowDeleteConfirm(true); // Show confirmation dialog
   };

   // Cancel Deletion
   const handleCancelDelete = () => {
      setShowDeleteConfirm(false); // Close confirmation dialog without deleting
      setUserToDelete(null); // Reset user to delete
   };
   
   // Delete User
   const handleUserDelete = () => {
      if (userToDelete && userToDelete.id) {
         api
            .delete(`/api/users/${userToDelete.id}/`)
            .then((res) => {
                  if (res.status === 200 || res.status === 204) {
                     getUsers(); // Refresh the user list after deletion
                  } else {
                     alert("Failed to delete user.");
                  }
                  setShowDeleteConfirm(false); // Close confirmation dialog
                  setUserToDelete(null); // Reset user to delete
            })
            .catch((err) => {
                  alert("Error deleting user.");
                  setShowDeleteConfirm(false); // Close confirmation dialog
                  setUserToDelete(null); // Reset user to delete
            });
      }
   };
   // STOP - Confirming Deletion

   const [showUserForm, setShowUserForm] = useState(false);
   const [selectedUser, setSelectedUser] = useState(null);
   const [userName, setUserName] = useState("");
   const [userEmail, setUserEmail] = useState("");
   const [userRole, setUserRole] = useState("");
   const [userPassword, setUserPassword] = useState("");
   
   useEffect(() => {
      getUsers();
   }, []);
   
   const getUsers = () => {
      api
         .get('/api/users/')
         .then((res) => setUsers(res.data))
         .catch((err) => alert(`Error fetching users: ${err.message}`));
   };
   
   const paginateUsers = () => {
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      return users.slice(startIndex, endIndex);
   };
   
   const handlePageChange = (direction) => {
      if (direction === 'next' && currentPage < totalPages) {
         setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 1) {
         setCurrentPage(currentPage - 1);
      }
   };
   
   const handleUserEditClick = (user) => {
      setSelectedUser(user);
      setUserName(user.username);
      setUserEmail(user.email);
      setUserRole(user.role);
      setUserPassword("");
      setShowUserForm(true);
   };
   
   const toggleUserForm = () => {
      setShowUserForm(!showUserForm);
      if (!showUserForm) {
         setSelectedUser(null);
         setUserName("");
         setUserEmail("");
         setUserRole("");
         setUserPassword("");
      }
   };
   
   const handleFormSubmit = (e) => {
      e.preventDefault();
      
      const userData = {
         username: userName,
         email: userEmail,
         role: userRole,
         password: userPassword,
      };
      
      const request = selectedUser
         ? api.put(`/api/users/${selectedUser.id}/`, userData)
         : api.post('/api/users/', userData);
      
      request
         .then(() => {
         // alert(selectedUser ? 'User updated successfully!' : 'User created successfully!');
         getUsers();
         toggleUserForm();
         })
         .catch((err) => alert(`Error saving user: ${err.message}`));
   };

   return (
      <div className="my-2 mx-8 text-black">
         <div className="flex flex-row items-center space-x-8 mb-4">
            <div className="flex flex-row items-center space-x-4" title='Users from the server will be displayed in the table below'>
            <AccountCircleIcon 
               fontSize="large" 
               sx={{
                  marginTop: '2px',
                  color: "rgb(28, 76, 113)",
               }}
            />
               <h2 className="text-3xl text-white font-semibold">
                  Users - {users.length}
               </h2>
            </div>
            
            <RefreshButton 
               rotateTimeInSeconds={1}
               onClick={getUsers} 
            />
            <Button
               onClick={toggleUserForm}
               sx={{
                  padding: '0px',
                  fontSize: '1rem',
                  color: 'rgb(250 250 250)',
                  backgroundColor: "rgb(28, 76, 113)",
                  '&:hover': {
                     backgroundColor: "rgb(65, 156, 214)"
                  }
               }}
            >
               +
            </Button>
         </div>
         <TableContainer sx={{ maxWidth: '100%'}}>
            <Table sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
               <TableHead sx={{ background: 'rgb(28, 76, 113)' }}>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width: '20%' }}>User ID</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width: '20%' }}>Username</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width: '20%' }}>Email</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width: '20%' }}>Role</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width: '20%' }}>Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
               {[
                  currentUser && paginateUsers().find(user => user.id === currentUser.currentUser.id), 
                  ...paginateUsers().filter(user => user.id !== currentUser?.currentUser?.id)
               ].filter(user => user).map((user) => (
                  <TableRow
                     key={user.id}
                     sx={{
                        backgroundColor: currentUser && currentUser.currentUser && currentUser.currentUser.id === user.id ? '#419cd6' : 'transparent',
                        '&:hover': {
                           backgroundColor: currentUser && currentUser.currentUser && currentUser.currentUser.id === user.id ? '#74c1f2' : '#74c1f2',
                        }
                     }}
                  >
                        <TableCell sx={{color: '#FFF'}} >{user.id}</TableCell>
                        <TableCell sx={{color: '#FFF'}} >{user.username}</TableCell>
                        <TableCell sx={{color: '#FFF'}} >{user.email}</TableCell>
                        <TableCell sx={{color: '#FFF'}} >{findRoleName(user?.role)}</TableCell>
                        <TableCell>
                           <div className="flex opacity-100 md:opacity-0 hover:opacity-100 space-x-2 transition-opacity duration-200">
                              <Button
                                 onClick={() => handleUserEditClick(user)}
                                 sx={{ color: '#FFF', backgroundColor: '#eab308', '&:hover': { backgroundColor: '#ca8a04' } }}
                                 startIcon={<EditIcon />}
                              />
                              {user.id !== currentUser?.currentUser?.id && (  // Condition to hide delete button for current user
                                 <Button
                                    onClick={() => handleUserDeleteConfirmation(user)}
                                    sx={{ color: '#FFF', backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
                                    startIcon={<DeleteIcon />}
                                 />
                              )}
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
         
         {/* Back and Next Arrows for pages of the Users List */}
         {/* NOTE: These arrows and page indicators will only be shown when there is more than one page worth of users */}
         {totalPages > 1 && 
            <div className="flex justify-end items-center mt-4">
               <Button 
                  onClick={() => handlePageChange('prev')} 
                  disabled={currentPage === 1} // Disable the button when on the first page 
                  sx={{
                     padding: '0', 
                     minWidth: 'auto',
                     background: 'transparent', // Initial bg color
                     color: '#000', // Initial icon color
                     '&:hover': {
                        color: '#FFF', // Hover icon color
                        background: 'rgb(28, 76, 113)', // Hover bg color
                     }
                  }}
               >
                  <ArrowBack /> {/* Use MUI's ArrowBack icon */}
               </Button>
               <span className="mx-4">
                  Page {currentPage} / {totalPages}
               </span>
               <Button 
                  onClick={() => handlePageChange('next')} 
                  disabled={currentPage === totalPages} // Disable the button when on the last page
                  sx={{
                     padding: '0', 
                     minWidth: 'auto',
                     background: 'transparent', // Initial bg color
                     color: '#000', // Initial icon color
                     '&:hover': {
                        color: '#FFF', // Hover icon color
                        background: 'rgb(28, 76, 113)', // Hover bg color
                     }
                  }}
               >
                  <ArrowForward /> {/* Use MUI's ArrowForward icon */}
               </Button>
            </div>
         }
         
         {/* CONFIRM DELETE MODAL */}
         {showDeleteConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
               <div className="bg-white w-4/5 max-w-xs p-8 rounded-md shadow-lg">
                     <h2 className="text-2xl font-semibold text-center mb-10">
                        Are you sure you want to delete this user?
                     </h2>
                     <div className="flex justify-center space-x-4">
                        <Button 
                           onClick={handleUserDelete}
                           sx={{
                                 color: '#FFF',
                                 borderRadius: '8px', // Rounded edges
                                 display: 'flex',
                                 alignItems: 'center', // Vertically center the icon
                                 justifyContent: 'center', // Horizontally center the icon
                                 backgroundColor: '#ef4444',
                                 '&:hover': {
                                    backgroundColor: '#dc2626',
                                 },
                           }}
                        >
                           Delete
                        </Button>
                        <Button 
                           onClick={handleCancelDelete} 
                           sx={{
                                 color: '#FFF',
                                 borderRadius: '8px', // Rounded edges
                                 display: 'flex',
                                 alignItems: 'center', // Vertically center the icon
                                 justifyContent: 'center', // Horizontally center the icon
                                 backgroundColor: '#525252', // Gray
                                 '&:hover': {
                                    backgroundColor: '#27272a',
                                 },
                           }}
                        >
                           Cancel
                        </Button>
                     </div>
               </div>
            </div>
         )}
         
         {/* User Form */}
         {showUserForm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
               <div className="bg-white w-4/5 max-w-3xl p-8 rounded-md shadow-lg">
                  <h2 className="text-3xl font-semibold mb-6 text-center">
                     {selectedUser ? "Edit User" : "Create User"}
                  </h2>
                  <form
                     onSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit(e); // Handle the form submission by sending PUT or CREATE request to API
                        toggleUserForm();
                     }}
                     className="space-y-6"
                  >
                     <div>
                        <TextField
                           id="username"
                           label="Username"
                           variant="outlined"
                           value={userName}
                           onChange={(e) => setUserName(e.target.value)}
                           fullWidth
                           required
                        />
                     </div>
                     <div>
                        <TextField
                           id="email"
                           label="Email"
                           type="email"
                           variant="outlined"
                           value={userEmail}
                           onChange={(e) => setUserEmail(e.target.value)}
                           fullWidth
                           required
                        />
                     </div>
                     <div>
                        <TextField
                           id="password"
                           label="Password"
                           type="password"
                           variant="outlined"
                           value={userPassword}
                           onChange={(e) => setUserPassword(e.target.value)}
                           fullWidth
                           required
                        />
                     </div>
                     <div>
                     <FormControl fullWidth required>
                        <InputLabel id="role-label">Select Role</InputLabel>
                        <Select
                           labelId="role-label"
                           id="role"
                           value={userRole || ""}
                           onChange={(e) => setUserRole(e.target.value)}
                           label="Select Role"
                           fullWidth
                           variant="outlined"
                        >
                           {roles.map((role) => (
                              <MenuItem key={role.id} value={role.id}>
                                 {role.name}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                     </div>
                     <div className="flex justify-end space-x-4">
                        <Button
                              type="submit"
                              sx={{
                                 paddingTop: '0px',
                                 paddingBottom: '0px',
                                 fontSize: '1rem', // Text size: Tailwind's text-sm equivalent
                                 color: 'rgb(250 250 250)', // White Text
                                 backgroundColor: "rgb(28, 76, 113)",
                                 '&:hover': {
                                    backgroundColor: "rgb(65, 156, 214)"
                                 },
                                 minWidth: '32px', // Removes default width restrictions if any
                                 maxHeight: '32px', // Set a max height
                                 textTransform: 'none'
                              }}
                        >
                        {selectedUser ? "Update" : "Create"}
                        </Button>
                        <Button
                              onClick={toggleUserForm}
                              sx={{
                                 paddingTop: '4px',
                                 paddingBottom: '4px',
                                 fontSize: '1rem', // Text size: Tailwind's text-sm equivalent
                                 color: 'rgb(250 250 250)', // White Text
                                 backgroundColor: '#525252', // Gray
                                 '&:hover': {
                                    backgroundColor: '#27272a', // Darker gray
                                 },
                                 minWidth: '32px', // Removes default width restrictions if any
                                 maxHeight: '32px', // Set a max height
                                 textTransform: 'none'
                              }}
                        >
                        Cancel
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div> // Outermost div closing
   ); // HTML content closing
}; // Component Closing

export default UsersSection;


