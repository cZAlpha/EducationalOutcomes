import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Select, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from "@mui/icons-material/List";
import { ArrowBack, ArrowForward } from '@mui/icons-material'; // Import MUI icons
import React, { useState, useEffect } from 'react';
import RefreshButton from './RefreshButton';
import api from '../api'; // Import API handler


const LogsSection = ({ currentUser }) => { // Has args of currentUser ONLY so that logs created using this section will bear the currentUser's id, and so this component only calls api routes related to logs
   const [showLogForm, setShowLogForm] = useState(false); // All log related variables
   const [logs, setLogs] = useState([]);
   const [logDescription, setLogDescription] = useState("");
   const [logAction, setLogAction] = useState("");
   const [selectedLog, setSelectedLog] = useState(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [logToDelete, setLogToDelete] = useState(null);
   // Page handling variables
   const [currentPage, setCurrentPage] = useState(1); // Handles the current page and sets it to the first page upon instantiation
   const logsPerPage = 5; // Set how many logs to display per page
   const totalPages = Math.ceil(logs.length / logsPerPage); // Calculate total pages

   const paginateLogs = () => {
      const startIndex = (currentPage - 1) * logsPerPage;
      const endIndex = startIndex + logsPerPage;
      return logs.slice(startIndex, endIndex);
   };

   const handlePageChange = (direction) => {
      if (direction === 'next' && currentPage < totalPages) {
         setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 1) {
         setCurrentPage(currentPage - 1);
      }
   };
   
   const getLogs = () => {
      api
         .get("/api/logs/")
         .then((res) => res.data)
         .then((data) => {
            setLogs(data);
            //console.log(data); // For debugging, remove in production
         })
         .catch((err) => alert(`Error fetching logs: ${err.message}`));
   };
   
   const toggleLogForm = () => {
      setShowLogForm(!showLogForm);
      setSelectedLog(null); // Reset selected log when toggling form
   };
   
   // Create Log
   const createLog = (e) => {
      e.preventDefault();
      const timestamp = new Date().toISOString(); // Get current timestamp
      console.log("LogsSection | Current User On Create Log: ", currentUser.username, " with id: ", currentUser.id)
      const logData = {
         user: currentUser.id, // Using logged-in user's ID
         action: logAction, // REQUIRED input
         timestamp, // REQUIRED (auto handled)
         description: logDescription, // Optional input
      };
      
      api
         .post("/api/logs/", logData)
         .then((res) => {
            if (res.status === 201) {
               //alert("Log created!");
               console.log("LogsSection | Log Created with data: ", logData)
            }
            else alert("Failed to create log.");
            getLogs();
         })
         .catch((err) => alert(err));
   };
   
   // Edit Log
   const editLog = (e) => {
      e.preventDefault();
      if (selectedLog && selectedLog.id) {
         api
            .put(`/api/logs/${selectedLog.id}/`, {
               action: logAction,
               description: logDescription,
            })
            .then((res) => {
                  if (res.status === 200) alert("Log updated!");
                  else alert("Failed to update log.");
                  getLogs();
                  setSelectedLog(null); // Reset selectedLog after update
                  setLogDescription(""); // Clear form fields
                  setLogAction("");
            })
            .catch((err) => alert(err));
      } else {
         alert("No log selected for update");
      }
   };
   
   // Delete Log
   const handleLogDelete = () => {
      if (logToDelete && logToDelete.id) {
         api
            .delete(`/api/logs/${logToDelete.id}/`)
            .then((res) => {
               if (res.status === 200 || res.status === 204) {
                  // alert("Log deleted!");
                  getLogs();
               } else {
                  alert("Failed to delete log.");
               }
               setShowDeleteConfirm(false); // Close confirmation dialog
               setLogToDelete(null); // Reset log to delete
            })
            .catch((err) => {
               alert("Error deleting log.");
               setShowDeleteConfirm(false); // Close confirmation dialog
               setLogToDelete(null); // Reset log to delete
            });
      }
   };
   
   // Handle Log Edit
   const handleLogEditClick = (log) => {
      console.log("Currently selected log: ", log) // DELETE BEFORE PROD.
      setSelectedLog(log);
      setLogDescription(log.description);
      setLogAction(log.action);
      setShowLogForm(true); // Open the log form
   };
   
   // Ask for confirmation before deleting the log
   const handleLogDeleteConfirmation = (log) => {
      setLogToDelete(log); // Save the log to be deleted
      setShowDeleteConfirm(true); // Show confirmation dialog
   };
   
   const handleCancelDelete = () => {
      setShowDeleteConfirm(false); // Close confirmation dialog without deleting
      setLogToDelete(null); // Reset log to delete
   };
   
   useEffect(() => {
      getLogs(); // Gets all logs
   }, []);
   
   return (
      <div className="my-2 mx-8 text-black"> {/* Top Navbar For Logs Section */}
         <div className="flex flex-row items-center space-x-8 mb-4">
            <div className="flex flex-row items-center space-x-4" title='Logs from the server will be displayed in the table below'>
               <ListIcon 
                  fontSize="large" 
                  sx={{
                     marginTop: '2px',
                     color: "rgb(16, 115, 52)",
                     '&:hover': {
                        color: "rgb(22 163 74)"
                     }
                  }}
               />
               <h2 
                  className="text-3xl font-semibold"
                  
               >
                  Logs - {logs.length}
               </h2>
            </div>
            
            <RefreshButton
               rotateTimeInSeconds={1}
               onClick={getLogs}
            />
            
            {!showLogForm && ( // Only shows the add log button when you aren't adding a log to ensure no double click
            <Button
               onClick={toggleLogForm}
               sx={{
                  padding: '0px',
                  fontSize: '1rem',
                  color: 'rgb(250 250 250)',
                  backgroundColor: 'rgb(22 163 74)',
                  '&:hover': {
                  backgroundColor: 'rgb(34 197 94)',
                  },
               }}
            >
               +
            </Button>
            )}
         </div>
         
         <TableContainer sx={{ maxWidth: '100%'}}>
            <Table sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
               <TableHead sx={{ background: 'rgb(22 163 74)'}}>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>Log ID</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>USER ID</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>Action</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>Timestamp</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>Description</TableCell>
                     <TableCell sx={{ fontWeight: 'bold', color: '#FFF', width:"16%" }}>Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {paginateLogs().map((log) => (
                     <TableRow key={log.id} sx={{ '&:hover': { backgroundColor: '#d5f0dd' } }}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{log?.user ? log.user : "N/A"}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.description.length > 20 ? `${log.description.slice(0, 20)}...` : log.description}</TableCell>
                        <TableCell>
                           <div className="flex opacity-100 md:opacity-0 hover:opacity-100 space-x-2 transition-opacity duration-200">
                              <Button 
                                 onClick={() => handleLogEditClick(log)} 
                                 sx={{ 
                                    color: '#FFF', 
                                    paddingLeft: '12px', 
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#eab308', 
                                    '&:hover': {
                                    backgroundColor: '#ca8a04', 
                              },
                                 }} 
                                 startIcon={<EditIcon />} />
                              <Button 
                                 onClick={() => handleLogDeleteConfirmation(log)} 
                                 sx={{ 
                                    color: '#FFF', 
                                    paddingLeft: '12px', 
                                    width: '40px', 
                                    height: '40px',
                                    backgroundColor: '#ef4444',
                                    '&:hover': {
                                       backgroundColor: '#dc2626',
                                    }
                                 }} 
                                 startIcon={<DeleteIcon />} />
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Back and Next Arrows for pages of the Logs List */}
         {/* NOTE: These arrows and page indicators will only be shown when there is more than one page worth of logs */}
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
                        background: 'rgb(22 163 74)', // Hover bg color
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
                        background: 'rgb(22 163 74)', // Hover bg color
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
               Are you sure you want to delete this log?
               </h2>
               <div className="flex justify-center space-x-4">
                  <Button 
                     onClick={handleLogDelete}
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
                           backgroundColor: '#27272a', // Darker gray
                        },
                     }}
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         </div>
         )}
         
         {/* EDIT/CREATE LOG FORM */}
         {showLogForm && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-4/5 max-w-3xl p-8 rounded-md shadow-lg">
               <h2 className="text-3xl font-semibold text-green-800 mb-6 text-center">
               {selectedLog ? `Edit Log ${selectedLog.id}` : "Create Log"}
               </h2>
               <form
                  onSubmit={(e) => {
                     e.preventDefault();
                     selectedLog ? editLog(e) : createLog(e);
                     toggleLogForm();
                  }}
               >
                  <div>
                     <label>Action:</label>
                     <Select
                        value={logAction}
                        onChange={(e) => setLogAction(e.target.value)}
                        fullWidth
                        required
                     >
                        <MenuItem value="CREATE">Create</MenuItem>
                        <MenuItem value="UPDATE">Update</MenuItem>
                        <MenuItem value="DELETE">Delete</MenuItem>
                        <MenuItem value="LOGIN">Login</MenuItem>
                        <MenuItem value="LOGOUT">Logout</MenuItem>
                        <MenuItem value="ERROR">Error</MenuItem>
                     </Select>
                  </div>
                  
                  <div>
                     <label>Description:</label>
                     <TextField
                        value={logDescription}
                        onChange={(e) => setLogDescription(e.target.value)}
                        fullWidth
                        required
                        multiline
                     />
                  </div>
                  
                  <div className='flex flex-grow flex-col md:flex-row mt-4 justify-end gap-x-0 gap-y-2 md:gap-y-0 md:gap-x-4'>
                     <Button 
                        type="submit"
                        sx={{
                           paddingTop: '0px',
                           paddingBottom: '0px',
                           fontSize: '1rem', // Text size: Tailwind's text-sm equivalent
                           color: 'rgb(250 250 250)', // White Text
                           backgroundColor: 'rgb(22 163 74)', // Tailwind's green-600
                           '&:hover': {
                              backgroundColor: 'rgb(34 197 94)', // Tailwind's green-500
                           },
                           minWidth: '32px', // Removes default width restrictions if any
                           maxHeight: '32px', // Set a max height
                           textTransform: 'none'
                        }}
                     >
                        Submit
                     </Button>
                     <Button 
                        type="button" 
                        onClick={toggleLogForm}
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
      </div>
   );
};

export default LogsSection;
