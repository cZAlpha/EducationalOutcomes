import React, { useEffect, useState } from "react";
import SpecificCoursesSectionCard from "./SpecificCoursesSectionCard";
import { IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent, Select, MenuItem, InputLabel, FormControl, Autocomplete, FormHelperText } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from '../../api';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import { useAuth } from "../AuthProvider";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InfoIcon from '@mui/icons-material/Info';


function SpecificCourseInformation({ course, semesters, sections, CLOs, PLOs, PLOCLOMappings }) {
   const { user } = useAuth();
   const [isUserAdmin, setIsUserAdmin] = useState(false);
   const navigate = useNavigate(); // For navigating to specific section page
   const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false); // To track archive course modal visibility
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To track delete course modal visibility
   const [isReinstateModalOpen, setIsReinstateModalOpen] = useState(false); // Tracks if the reinstate course model is open
   const [selectedTab, setSelectedTab] = useState("Sections");
   const [extraSections, setExtraSections] = useState([]); // Keeps track of added sections
   const [instructors, setInstructors] = useState([]);
   const [aVersions, setAVersions] = useState([]);
   const [expandedCLO, setExpandedCLO] = useState(null); // State to track which CLO is expanded
   const [coursePerformance, setCoursePerformance] = useState({}); // Obj to store the performance of the course
   const [loading, setLoading] = useState(true); // State to track loading status
   
    // Modal Variables
      // AddNew Section Modal Variables
   const [openForm, setOpenForm] = useState(false);
   const [existingSectionNumbers, setExistingSectionNumbers] = useState([]); // To store all existing section numbers, as to not allow the user to repeat a section number
   const [selectedSectionNumber, setSelectedSectionNumber] = useState('');
   const [selectedSemester, setSelectedSemester] = useState('');
   const [selectedCRN, setSelectedCRN] = useState('');
   const [selectedInstructor, setSelectedInstructor] = useState(null);
   const [error, setError] = useState(""); // To gracefully display errors to the user
      // Edit Course Modal Variables
   const [editModalTab, setEditModalTab] = useState("General");
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editedCourse, setEditedCourse] = useState({
      name: course.name,
      description: course.description,
      course_number: course.course_number,
      a_version: course.a_version_details,
      date_added: course.date_added,
      date_removed: course.date_removed,
      clos: [],
      plo_clo_mappings: []
   });
   const [editedCLOs, setEditedCLOs] = useState([]);
   const [editedMappings, setEditedMappings] = useState([]);
   const [newCLO, setNewCLO] = useState({
      designation: '',
      description: '',
      mappings: []
   });
   
   
   const getBackgroundColor = (score) => {
      if (score < 70) return 'bg-red-500';
      if (score < 80) return 'bg-orange-500';
      if (score < 84) return 'bg-yellow-300';
      if (score < 90) return 'bg-green-200';
      if (score < 95) return 'bg-green-400';
      return 'bg-green-600';
   };
   
   // Create a mapping of CLOs to their corresponding PLOs
   const cloToPloMap = CLOs.reduce((acc, clo) => {
      acc[clo.clo_id] = PLOCLOMappings
      .filter((mapping) => mapping.clo === clo.clo_id)
      .map((mapping) => PLOs.find((plo) => plo.plo_id === mapping.plo));
      return acc;
   }, {});
   
   const handleOpenForm = () => {
      setOpenForm(true);
   };
   
   const handleCloseForm = () => {
      setSelectedSectionNumber('');
      setSelectedSemester('');
      setSelectedCRN('');
      setSelectedInstructor(null);
      setError(""); // Remove any error before closing
      setOpenForm(false); // Close the form
   };
   
   const handleAddSection = async () => {
      if (!selectedSectionNumber || !selectedSemester || !selectedCRN || !selectedInstructor) {
         alert("All fields are required.");
         return;
      }
      
      const newSection = {
         course: course.course_id,
         section_number: selectedSectionNumber,
         semester: Number(selectedSemester.semester_id),
         crn: selectedCRN,
         instructor: selectedInstructor.user_id,
      };
      
      try {
         const res = await api.post('/api/sections/', newSection);
         setExtraSections([...extraSections, res.data]);
         setError(""); // Clear error if successful
         handleCloseForm();
      } catch (err) {
         setError(err.response?.data?.message || "An error occurred while adding the section. Your input is incorrect.");
      }
   };
   
   // START - Get all Accreditation Versions (used for editing course)
   const getAllAVersions = async () => {
      try {
         const res = await api.get('api/accreditation-versions/');
         setAVersions(res.data);
      } catch(error) {
         alert("Could not get accreditation versions!");
         console.error(error);
      }
   };
   // STOP  - Get all Accreditation Versions (used for editing course)
   
   // START - Existing Section Numbers Fetching
   const getAllSectionsNumbers = async () => {
      // Step 1: Get the section's course
      let courseId = course.course_id;
      // Step 2: Query the backend for all sections of the given courseId, then push them into the existingSectionNumbers array.
      if (courseId) {
         try {
            const res = await api.get(`/api/courses/${courseId}/sections/`);
            setExistingSectionNumbers(res.data);
         } catch (err) {
            alert(`Error fetching Section Numbers: ${err.message}`);
         }
      } else {
         alert("CourseId could not be parsed and therefore, all sections could not be fetched.")
      }
   };
   // STOP  - Existing Section Numbers Fetching
   
   const handleSectionClick = (sectionId) => { // Navigates to the given specific section page
      navigate(`/sections/${sectionId}`);
   };
   
   // START - Functions to handle input changes for editing course form
   const handleEditCourseInputChange = (field, value) => {
      setEditedCourse(prev => ({
      ...prev,
      [field]: value
      }));
   };
   
   const handleAddCLO = () => {
      if (!newCLO.designation || !newCLO.description) {
         alert('Designation and description are required');
         return;
      }
      
      const cloToAdd = {
         course: course.course_id,
         designation: newCLO.designation,
         description: newCLO.description,
         created_by: user.user_id
      };
      
      setEditedCLOs([...editedCLOs, cloToAdd]);
      setNewCLO({ designation: '', description: '', mappings: [] });
   };
   
   const handleDeleteCLO = (cloId) => {
      setEditedCLOs(editedCLOs.filter(clo => clo.clo_id !== cloId));
      setEditedMappings(editedMappings.filter(mapping => mapping.clo !== cloId));
   };
   
   const handleAddMapping = (cloId) => {
      const ploToAdd = prompt('Enter PLO designation to map (e.g., "1", "2")');
      if (!ploToAdd) return;
      
      const plo = PLOs.find(p => p.designation === ploToAdd);
      if (!plo) {
         alert(`PLO ${ploToAdd} not found`);
         return;
      }
      
      const newMapping = {
         clo: cloId,
         plo: plo.plo_id
      };
      
      setEditedMappings([...editedMappings, newMapping]);
   };
   
   const handleDeleteMapping = (mappingId) => {
      setEditedMappings(editedMappings.filter(m => m.mapping_id !== mappingId));
   };
   // STOP  - Functions to handle input changes for editing course form
   
   // START - Function that handles closing the edit course modal
   const handleCloseEditCourseModal = () => {
      setEditedCourse({
         name: course.name,
         description: course.description,
         course_number: course.course_number,
         a_version: course.a_version_details.a_version,
         date_added: course.date_added,
         date_removed: course.date_removed
      });
      setIsEditModalOpen(false);
   };
   // STOP  - Function that handles closing the edit course modal
   
   // START - Save Course Changes
   const handleSaveCourseChanges = async () => {
      try {
         const formatDateForBackend = (dateString) => {
            if (!dateString) return null;
            // Ensure we only send the date portion (YYYY-MM-DD)
            return dateString.split('T')[0];
         };
         
         console.log("Non-normalized Course Data: ", editedCourse);
         
         // Prepare CLO data without IDs
         const normalizedCLOs = editedCLOs.map(clo => ({
            course: course.course_id,
            designation: clo.designation,
            description: clo.description,
            created_by: user.user_id
         }));
         
         // Create a map of CLO IDs to their designations (for existing CLOs)
         const cloDesignationMap = {};
         CLOs.forEach(clo => {
            cloDesignationMap[clo.clo_id] = clo.designation;
         });
         
         // Normalize mappings using CLO designations instead of IDs
         const normalizedMappings = editedMappings.map(mapping => {
            // Use designation if available, otherwise fall back to ID mapping
            const cloIdentifier = cloDesignationMap[mapping.clo] || mapping.clo;
            
            return {
            clo: cloIdentifier,  // Using designation instead of ID
            plo: mapping.plo     // PLO ID
            };
         });
         
         // Prepare the data to send
         const dataToSend = {
            ...editedCourse,
            // Ensure accreditation_version is sent as ID if it's an object
            a_version: Number(editedCourse.a_version?.a_version_id),
            date_added: formatDateForBackend(editedCourse.date_added),
            date_removed: formatDateForBackend(editedCourse.date_removed),
            clos: normalizedCLOs,
            plo_clo_mappings: normalizedMappings
         };
         
         console.log("Updated Course Data Sent to Backend: ", dataToSend);
         const res = await api.patch(`/api/courses/${course.course_id}/`, dataToSend);
         if (res.status == 200) {
            alert("Course data successfully updated.");
         } else {
            alert("Course data update failed!")
         }
         navigate("/courses");
         setIsEditModalOpen(false);
      } catch (err) {
      alert(`Error updating course: ${err.message}`);
      }
   };
   // STOP  - Save Course Changes
   
   //  START - Archive Course
   const handleArchive = async () => {
      try {
         // Get the current date in YYYY-MM-DD format
         const currentDate = new Date().toISOString().split('T')[0]; // Extract the date part (YYYY-MM-DD)
         console.log("Current Date: ", currentDate);
         
         // Send the PUT request with the required fields
         await api.patch(`/api/courses/${course.course_id}/`, {
            date_removed: currentDate, // Automatically set date_removed to current date
         });
         navigate("/courses/");
      } catch (err) {
         alert(`Error updating course: ${err.message}`);
      }
   };
   //  STOP  - Archive Course
   
   // START - Delete Course
   const handleRemove = async () => {
      try {
         // Send the DELETE request
         const response = await api.delete(`/api/courses/${course.course_id}/`);
         if (response.status == 200) { // If deletion was successful
            alert('Course successfully deleted.');
            navigate("/courses/");
         } else if (response.status == 403) { // Unauthorized failure
            alert("You do not have authority to delete a course!");
         } else { // Uncaught failure
            alert("Error deleting course. Status code not recognized, was not 200 or 403, was: ", response.status);
         }         
      } catch (err) {
         alert(`Error deleting course: ${err.message}`);
      }
   };
   // STOP  - Delete Course
   
   //  START - Reinstate Course
   const handleReinstate = async () => {
      try {
         // Send the PUT request with null to remove date_removed
         await api.patch(`/api/courses/${course.course_id}/`, {
            date_removed: null, // Set date_removed to null
         });
         navigate("/courses/");
      } catch (err) {
         alert(`Error updating course: ${err.message}`);
      }
   };
   //  STOP  - Reinstate Course
   
   // START - Course Performance data fetching
   const getCoursePerformance = async () => {
      try {
         const res = await api.get(`/api/courses/${course.course_id}/performance/`);
         
         if (!res.data || (!res.data.clo_performance && !res.data.plo_performance)) {
            setCoursePerformance({});
            return;
         }
         
         // Map CLO IDs to their corresponding 'designation' and 'description'
         const mappedCLOPerformance = res.data.clo_performance
            ? Object.entries(res.data.clo_performance).map(([cloId, score]) => {
                  const cloObj = CLOs.find(clo => clo.clo_id === parseInt(cloId)); // Match CLO object by ID
                  return {
                     designation: cloObj ? cloObj.designation : `Unknown CLO (${cloId})`,
                     description: cloObj ? cloObj.description : "",
                     score: parseFloat(score).toFixed(2),
                  };
            })
            : [];
         
         // Map PLO IDs to their corresponding 'designation' and 'description'
         const mappedPLOPerformance = res.data.plo_performance
            ? Object.entries(res.data.plo_performance).map(([ploId, score]) => {
                  const ploObj = PLOs.find(plo => plo.plo_id === parseInt(ploId)); // Match PLO object by ID
                  return {
                     designation: ploObj ? ploObj.designation : `Unknown PLO (${ploId})`,
                     description: ploObj ? ploObj.description : "",
                     score: parseFloat(score).toFixed(2),
                  };
            })
            : [];
         
         // Combine CLO and PLO performance into state
         setCoursePerformance({
            CLOs: mappedCLOPerformance,
            PLOs: mappedPLOPerformance,
         });
         console.log("Course Performance: ", {
            CLOs: mappedCLOPerformance,
            PLOs: mappedPLOPerformance,
         } )
      } catch (err) {
         alert(`Error fetching Performance Data: ${err.message}`);
      }
   };   
   // STOP - Course Performance data fetching
   
   // START - Fetch all users to populate the autofill on the add new section form
   const getAllInstructors = async () => {
      try {
         const res = await api.get("/api/users/");
         console.log("Instructors: ", res.data);
         setInstructors(res.data);
      } catch(error) {
         console.error(error);
         alert("There was an error grabbing instructors.")
      }
   };
   // STOP  - Fetch all users to populate the autofill on the add new section form
   
   // START - User Role Ascertation
   const findUserRole = () => {
      if (user?.role.role_name == "Admin" || user?.role.role_name == "root") {
         setIsUserAdmin(true);
         console.log("User is an admin!");
      } else {
         console.log("User is NOT an admin! User: ", user);
      }
   };
   // STOP  - User Role Ascertation
   
   // useEffect to initialize CLOs and mappings when course data loads
   useEffect(() => {
      if (course && CLOs && PLOCLOMappings) {
         setEditedCLOs(CLOs);
         setEditedMappings(PLOCLOMappings);
      }
   }, [course, CLOs, PLOCLOMappings]);
   
   useEffect(() => { // ON MOUNT FUNCTION CALLS
      const fetchData = async () => {
         await getCoursePerformance();
         await getAllSectionsNumbers();
         await getAllInstructors();
         await getAllAVersions();
         setLoading(false); // Set loading to false when all data is fetched
      };
      fetchData();
      findUserRole();
      console.log("CLOs", CLOs);
   }, [])
   
   // HTML STUFF
   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="w-full flex flex-col md:flex-row justify-between mb-4 gap-x-4 gap-y-2">
            <button
               className={`px-4 py-2 rounded-md w-full font-bold
                  ${selectedTab === "Sections" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("Sections")}
            >
               Sections
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full font-bold 
                  ${selectedTab === "CLO Mappings" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("CLO Mappings")}
            >
               CLO Mappings
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full font-bold 
                  ${selectedTab === "Performance" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("Performance")}
            >
               Performance
            </button>
            {isUserAdmin && (
               <button
                  className={`px-4 py-2 rounded-md w-full font-bold 
                     ${selectedTab === "Settings" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => setSelectedTab("Settings")}
               >
                  <SettingsIcon />
               </button>
            )}
         </div>
         
         {/* Edit Modal */}
         {isEditModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[60%] md:w-1/3">
               <h3 className="font-bold text-lg mb-2">Make Changes to the Current Course</h3>
               
               {/* Tab Selector */}
               <div className="flex border-b mb-4 w-full justify-center">
               <button
                  className={`px-4 py-2 font-medium ${editModalTab === 'General' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setEditModalTab('General')}
               >
                  General
               </button>
               <button
                  className={`px-4 py-2 font-medium ${editModalTab === 'Mappings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setEditModalTab('Mappings')}
               >
                  Mappings
               </button>
               </div>
               
               {editModalTab === "General" && (
                  <>
                     {/* Course Accreditation Version */}
                     <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="accreditation-label">Accreditation Version</InputLabel>
                        <Select
                           labelId="accreditation-label"
                           label="Accreditation Version"
                           value={editedCourse.a_version || ''}
                           onChange={(e) => handleEditCourseInputChange('a_version', e.target.value)}
                        >
                           {aVersions.map((version) => (
                              <MenuItem
                                 key={version.a_version_id}
                                 value={version}
                              >
                                 {`${version.a_organization_details.name} - ${version.year}`}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  
                     {/* Course Name */}
                     <TextField
                     label="Course Name"
                     variant="outlined"
                     fullWidth
                     sx={{ mb: 2 }}
                     value={editedCourse.name || ''}
                     onChange={(e) => handleEditCourseInputChange('name', e.target.value)}
                     />
                     
                     {/* Course Description */}
                     <TextField
                     label="Course Description"
                     variant="outlined"
                     fullWidth
                     multiline
                     rows={3}
                     sx={{ mb: 2 }}
                     value={editedCourse.description || ''}
                     onChange={(e) => handleEditCourseInputChange('description', e.target.value)}
                     />
                     
                     {/* Course Number */}
                     <TextField
                     label="Course Number"
                     variant="outlined"
                     fullWidth
                     sx={{ mb: 2 }}
                     value={editedCourse.course_number || ''}
                     onChange={(e) => {
                        if (/^[a-zA-Z0-9-]*$/.test(e.target.value)) {
                           handleEditCourseInputChange('course_number', e.target.value)
                        }
                     }}
                     helperText="Format: ABC-123"
                     />
                     
                     
                     {/* Date Added */}
                     <TextField
                        label="Date Added"
                        type="date"
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        value={editedCourse.date_added?.split('T')[0] || ''}
                        onChange={(e) => handleEditCourseInputChange('date_added', e.target.value)}
                     />
                     
                     {/* Date Removed */}
                     <TextField
                        label="Date Removed"
                        type="date"
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        value={editedCourse.date_removed?.split('T')[0] || ''}
                        onChange={(e) => handleEditCourseInputChange('date_removed', e.target.value)}
                     />
                  </>
               )}
               
               
               {/* Mappings Tab Content */}
               {editModalTab === 'Mappings' && (
                  <div className="space-y-4">
                     <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Add New CLO</h4>
                        <div className="flex gap-2 mb-4">
                           <TextField
                              label="Designation"
                              value={newCLO.designation}
                              onChange={(e) => setNewCLO({...newCLO, designation: e.target.value})}
                              size="small"
                           />
                           <TextField
                              label="Description"
                              value={newCLO.description}
                              onChange={(e) => setNewCLO({...newCLO, description: e.target.value})}
                              size="small"
                              fullWidth
                           />
                           <Button 
                              variant="contained" 
                              onClick={handleAddCLO}
                              disabled={!newCLO.designation || !newCLO.description}
                           >
                              Add
                           </Button>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        {editedCLOs.map((clo) => (
                           <Accordion key={clo.clo_id || clo.designation}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <div className="flex items-center justify-between w-full">
                                 <div>
                                    <span className="font-bold">CLO {clo.designation}</span>
                                    <span className="ml-2 text-gray-600">{clo.description}</span>
                                 </div>
                                 <IconButton 
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCLO(clo.clo_id || clo.designation);
                                    }}
                                    size="small"
                                    color="error"
                                 >
                                    <DeleteIcon fontSize="small" />
                                 </IconButton>
                              </div>
                              </AccordionSummary>
                              <AccordionDetails>
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                    <Typography variant="subtitle2">Mapped PLOs:</Typography>
                                    <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => handleAddMapping(clo.clo_id || clo.designation)}
                                    >
                                    Add PLO Mapping
                                    </Button>
                                 </div>
                                 
                                 {editedMappings
                                    .filter(m => m.clo === (clo.clo_id || clo.designation))
                                    .map(mapping => {
                                    const plo = PLOs.find(p => p.plo_id === mapping.plo);
                                    return (
                                       <div key={`${mapping.clo}-${mapping.plo}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                          <span>
                                          {plo ? `PLO ${plo.designation}: ${plo.description}` : 'PLO not found'}
                                          </span>
                                          <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={() => handleDeleteMapping(mapping.mapping_id)}
                                          >
                                          <DeleteIcon fontSize="small" />
                                          </IconButton>
                                       </div>
                                    );
                                    })}
                              </div>
                              </AccordionDetails>
                           </Accordion>
                        ))}
                     </div>
                  </div>
               )}
               
               <div className="flex justify-between mt-4">
                  {/* Save Button */}
                  <Button 
                     color="primary" 
                     variant="outlined" 
                     sx={{
                        minWidth: '40px',
                        minHeight: '50px',
                        borderColor: 'primary.main',
                        '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderColor: 'primary.main',
                        },
                     }}
                     onClick={handleSaveCourseChanges}
                  >
                     Save Changes
                  </Button>
                  <Button 
                     variant="contained" 
                     sx={{
                        minWidth: '40px',
                        minHeight: '50px',
                        backgroundColor: '#757575',
                        color: 'white',
                        boxShadow: 'none',
                        '&:hover': {
                        backgroundColor: '#616161',
                        },
                     }}
                     onClick={handleCloseEditCourseModal}
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         </div>
         )}
         
         {/* Archive Modal */}
         {isArchiveModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
               <div className="bg-white p-6 rounded-lg w-[60%] md:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Are you sure you want to archive this Course?</h3>
                  <p className="text-md italic mb-4 text-center pb-4">This will de-list the Course as active.</p>
                  <div className="flex justify-between">
                     {/* Delete Button */}
                     <Button color="error" variant="outlined" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           borderColor: 'error.main', // Border color for the outlined variant
                           '&:hover': {
                              backgroundColor: 'error.main', // Background color when hovered
                              color: 'white', // Text color changes to white on hover
                              borderColor: 'error.main', // Ensure border color stays the same
                           },
                        }}
                        onClick={handleArchive}
                     >
                        Yes, Archive
                     </Button>
                     <Button 
                        variant="contained" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           backgroundColor: '#757575', // Darker gray fill
                           color: 'white',              // White text
                           boxShadow: 'none',           // Remove drop shadow
                           '&:hover': {
                              backgroundColor: '#616161', // Even darker gray on hover
                           },
                        }}
                        onClick={() => setIsArchiveModalOpen(false)}
                     >
                        Cancel
                     </Button>
                  </div>
               </div>
            </div>
         )}
         
         {/* Delete Modal */}
         {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
               <div className="bg-white p-6 rounded-lg w-[60%] md:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Are you sure you want to delete this Course?</h3>
                  <p className="text-md italic mb-4 text-left pb-4">This will permanently delete this Course AND ALL OF ITS ASSOCIATED OBJECTS. All Sections, Evaluation Instruments and associated grades will be LOST FOREVER.</p>
                  <div className="flex justify-between">
                     {/* Delete Button */}
                     <Button color="error" variant="outlined" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           borderColor: 'error.main', // Border color for the outlined variant
                           '&:hover': {
                              backgroundColor: 'error.main', // Background color when hovered
                              color: 'white', // Text color changes to white on hover
                              borderColor: 'error.main', // Ensure border color stays the same
                           },
                        }}
                        onClick={handleRemove}
                     >
                        Yes, Delete
                     </Button>
                     {/* Cancel Button */}
                     <Button 
                        variant="contained" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           backgroundColor: '#757575', // Darker gray fill
                           color: 'white',              // White text
                           boxShadow: 'none',           // Remove drop shadow
                           '&:hover': {
                              backgroundColor: '#616161', // Even darker gray on hover
                           },
                        }}
                        onClick={() => setIsDeleteModalOpen(false)}
                     >
                        Cancel
                     </Button>
                  </div>
               </div>
            </div>
         )}
         
         {/* Reinstate Modal */}
         {isReinstateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
               <div className="bg-white p-6 rounded-lg w-[80%] md:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Are you sure you want to reinstate this Course?</h3>
                  <p className="text-md italic mb-4 pb-4">This will list the Course as active.</p>
                  <div className="flex justify-between">
                     {/* Reinstate Button */}
                     <Button color="primary" variant="outlined" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           borderColor: 'primary.main', // Border color for the outlined variant
                           '&:hover': {
                              backgroundColor: 'primary.main', // Background color when hovered
                              color: 'white', // Text color changes to white on hover
                              borderColor: 'primary.main', // Ensure border color stays the same
                           },
                        }}
                        onClick={handleReinstate}
                     >
                        Yes, Reinstate
                     </Button>
                     <Button 
                        variant="contained" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           backgroundColor: '#757575', // Darker gray fill
                           color: 'white',              // White text
                           boxShadow: 'none',           // Remove drop shadow
                           '&:hover': {
                              backgroundColor: '#616161', // Even darker gray on hover
                           },
                        }}
                        onClick={() => setIsReinstateModalOpen(false)}
                     >
                        Cancel
                     </Button>
                  </div>
               </div>
            </div>
         )}
         
         {/* Display Section */}
         {(!isArchiveModalOpen && !isDeleteModalOpen && !isEditModalOpen) && (
            <div className="w-full p-4 border rounded-md bg-gray-100 min-h-[200px]">
               {selectedTab === "Sections" ? (
                  <div>
                     {/* Header: Title & Add Icon */}
                     <div className="flex justify-between items-center mb-4 mx-2">
                        <h3 className="font-bold text-lg">Sections</h3>
                        <IconButton onClick={handleOpenForm} color="primary">
                           <AddIcon />
                        </IconButton>
                     </div>
                     {sections.length > 0 || extraSections.length > 0 ? (
                        <div className="flex flex-col gap-4">
                           {sections.map((section, index) => (
                              <div
                                 key={section.section_id}
                                 className="w-full"
                                 onClick={(e) => handleSectionClick(section.section_id, e)}
                                 style={{ cursor: "pointer", pointerEvents: "auto" }}
                              >                        
                                 <SpecificCoursesSectionCard
                                    key={`existing-${index}`}
                                    course={section.course_details.name} 
                                    section_number={section.section_number}
                                    semester={section.semester_details.designation} 
                                    crn={section.crn}
                                    instructor={section.instructor_details ? `${section.instructor_details.last_name}` : "N/A"}
                                 />
                              </div>
                           ))}
                           {extraSections.map((section, index) => (
                              <SpecificCoursesSectionCard
                                 key={`extra-${index}`}
                                 course_name={section.course_name}
                                 section_number={section.section_number}
                                 semester={section.semester}
                                 crn={section.crn}
                                 instructor={section.instructor_details ? `${section.instructor_details.last_name}` : "N/A"}
                              />
                           ))}
                        </div>
                     ) : (
                        <p>No sections available.</p>
                     )}
                  </div>
               ) : selectedTab === "CLO Mappings" ? (
                  <>
                     <h1 className="font-bold text-md mb-6">CLO Mappings</h1>
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                     >
                        {CLOs.map((clo) => (
                           <Accordion 
                              key={clo.clo_id}
                              sx={{
                                 mb: 2,
                                 boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                 borderRadius: '8px',
                                 '&:before': { display: 'none' } // Remove default divider
                              }}
                           >
                              <AccordionSummary 
                                 expandIcon={<ExpandMoreIcon />}
                                 sx={{
                                 backgroundColor: '#f8fafc',
                                 borderRadius: '8px',
                                 '&:hover': { backgroundColor: '#f1f5f9' },
                                 '&.Mui-expanded': {
                                    minHeight: '48px',
                                    margin: 0,
                                    backgroundColor: '#e2e8f0'
                                 }
                                 }}
                              >
                                 <div className="flex flex-row w-full">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                       <span className="font-bold text-blue-600">{clo.designation}</span>
                                    </div>
                                    <p className="pl-11 text-gray-600">{clo.description}</p>
                                 </div>
                              </AccordionSummary>
                              
                              <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                                 {cloToPloMap[clo.clo_id]?.length > 0 ? (
                                 <Card 
                                    variant="outlined" 
                                    sx={{ 
                                       borderColor: '#e2e8f0',
                                       boxShadow: 'none',
                                       borderRadius: '8px'
                                    }}
                                 >
                                    <CardContent sx={{ p: '16px !important' }}>
                                       <Typography 
                                       variant="subtitle1" 
                                       sx={{ 
                                          fontWeight: 700,
                                          color: '#394352',
                                          mb: 1.5,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1
                                       }}
                                       >
                                       <LinkIcon fontSize="small" />
                                          Mapped PLOs
                                       </Typography>
                                       
                                       <ul className="space-y-3">
                                       {cloToPloMap[clo.clo_id].map((plo) => (
                                          <li 
                                             key={plo.plo_id}
                                             className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                          >
                                             <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                             <span className="text-xs font-bold text-purple-600">{plo.designation}</span>
                                             </div>
                                             <div>
                                             <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                   textAlign: 'left',                                                   
                                                   color: '#64748b',
                                                   fontSize: '0.875rem'
                                                }}
                                             >
                                                {plo.description || "No description available"}
                                             </Typography>
                                             </div>
                                          </li>
                                       ))}
                                       </ul>
                                    </CardContent>
                                 </Card>
                                 ) : (
                                 <Typography 
                                    variant="body2" 
                                    sx={{ 
                                       color: '#94a3b8',
                                       fontStyle: 'italic',
                                       display: 'flex',
                                       alignItems: 'center',
                                       gap: 1
                                    }}
                                 >
                                    <InfoOutlinedIcon fontSize="small" />
                                    No mapped PLOs
                                 </Typography>
                                 )}
                              </AccordionDetails>
                           </Accordion>
                        ))}
                     </motion.div>
                  </>
               ) : selectedTab === "Performance" ? (
                  coursePerformance ? (
                     <>
                        <h1 className="font-bold text-md mb-6">Performance</h1>
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.4 }}
                           className="w-full p-4 border bg-white rounded-lg shadow"
                        >
                           {/* CLO Performance */}
                           <Accordion>
                                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className="font-bold text-lg">CLO Performance</Typography>
                                 </AccordionSummary>
                                 <AccordionDetails>
                                    {coursePerformance.CLOs && coursePerformance.CLOs.length > 0 ? (
                                       <ul className="space-y-2">
                                             {coursePerformance.CLOs.map((clo) => (
                                                <li key={clo.designation} className="bg-gray-100 p-2 rounded-lg">
                                                   <div className="flex flex-col gap-y-2">
                                                         <div className={`flex flex-row gap-x-4 pl-4 rounded-md ${getBackgroundColor(clo.score)}`}>
                                                            <h1 className="font-xl font-bold">{clo.designation}</h1>
                                                            <h1 className="font-xl font-bold">{clo.score}%</h1>
                                                         </div>
                                                         <p className="text-left pl-4 pr-4 pb-2">{clo.description}</p>
                                                   </div>
                                                </li>
                                             ))}
                                       </ul>
                                    ) : (
                                       <p className="text-gray-500">No CLO data available.</p>
                                    )}
                                 </AccordionDetails>
                           </Accordion>
                           
                           {/* PLO Performance */}
                           <Accordion>
                                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className="font-bold text-lg">PLO Performance</Typography>
                                 </AccordionSummary>
                                 <AccordionDetails>
                                    {coursePerformance.PLOs && coursePerformance.PLOs.length > 0 ? (
                                       <ul className="space-y-2">
                                             {coursePerformance.PLOs.map((plo) => (
                                                <li key={plo.designation} className="bg-gray-100 p-2 rounded-lg">
                                                   <div className="flex flex-col gap-y-2">
                                                         <div className={`flex flex-row gap-x-4 pl-4 rounded-md ${getBackgroundColor(plo.score)}`}>
                                                            <h1 className="font-xl font-bold">{plo.designation}</h1>
                                                            <h1 className="font-xl font-bold">{plo.score}%</h1>
                                                         </div>
                                                         <p className="text-left pl-4 pr-4 pb-2">{plo.description}</p>
                                                   </div>
                                                </li>
                                             ))}
                                       </ul>
                                    ) : (
                                       <p className="text-gray-500">No PLO data available.</p>
                                    )}
                                 </AccordionDetails>
                           </Accordion>
                        </motion.div>
                     </>
                  ) : (
                        <div>Loading Performance Data...</div> // Or any loading/placeholder content
                  )
               ) : (selectedTab === "Settings" ? (
                  course.date_removed === null ? (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                     >
                        <h3 className="font-bold text-lg mb-4">Settings</h3>
                        <div className="w-full p-4 border bg-white rounded-lg shadow">
                           <div className="flex flex-col justify-center items-center gap-4 mt-4">
                              {(!isArchiveModalOpen && !isDeleteModalOpen && !isEditModalOpen) && isUserAdmin && (
                                 <>
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-[60%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Edit this course</p>
                                       {/* Archive Button */}
                                       <Button 
                                          color="error" 
                                          variant="contained"
                                          sx={{
                                             width: '100px',
                                             minHeight: '50px',
                                             backgroundColor: 'warning.main',
                                             color: 'white',
                                             borderRadius: '0.375rem',
                                             '&:hover': {
                                                backgroundColor: 'warning.dark',
                                             },
                                          }}
                                          onClick={() => setIsEditModalOpen(true)}
                                       >
                                          Edit
                                       </Button>
                                    </div>
                                    
                                    <div className="w-[80%] flex items-center">
                                       <div className="flex-grow border-t border-gray-300"></div>
                                       <div className="flex-grow border-t border-gray-300"></div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-[60%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Archive this course?</p>
                                       {/* Archive Button */}
                                       <Button 
                                          color="error" 
                                          variant="contained"
                                          sx={{
                                             width: '100px',
                                             minHeight: '50px',
                                             backgroundColor: 'error.main',
                                             color: 'white',
                                             borderRadius: '0.375rem',
                                             '&:hover': {
                                                backgroundColor: 'error.dark',
                                             },
                                          }}
                                          onClick={() => setIsArchiveModalOpen(true)}
                                       >
                                          Archive
                                       </Button>
                                    </div>
                                    
                                    <div className="w-[80%] flex items-center">
                                       <div className="flex-grow border-t border-gray-300"></div>
                                       <div className="flex-grow border-t border-gray-300"></div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-[60%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Delete this course?</p>
                                       {/* Delete Button */}
                                       <Button 
                                          color="error" 
                                          variant="outlined"
                                          sx={{
                                             width: '100px',
                                             minHeight: '50px',
                                             borderColor: 'error.main',
                                             '&:hover': {
                                                backgroundColor: 'error.main',
                                                color: 'white',
                                                borderColor: 'error.main',
                                             },
                                          }}
                                          onClick={() => setIsDeleteModalOpen(true)}
                                       >
                                          DELETE
                                       </Button>
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>
                     
                     </motion.div>
                  ) : (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                     >
                        <h3 className="font-bold text-lg mb-4">Settings</h3>
                        <div className="w-full p-4 border bg-white rounded-lg shadow">
                           <div className="flex flex-col justify-center items-center gap-4 mt-4">
                                 {!isReinstateModalOpen && (
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-[80%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Reinstate this Course?</p>
                                       {/* Reinstate Button */}
                                       <Button color="primary" variant="outlined" 
                                          sx={{
                                             minWidth: '40px',
                                             minHeight: '50px',
                                             borderColor: 'primary.main', // Border color for the outlined variant
                                             '&:hover': {
                                                backgroundColor: 'primary.main', // Background color when hovered
                                                color: 'white', // Text color changes to white on hover
                                                borderColor: 'primary.main', // Ensure border color stays the same
                                             },
                                          }}
                                          onClick={() => setIsReinstateModalOpen(true)} // Show modal on button click
                                       >
                                          Reinstate
                                       </Button>
                                    </div>
                                 )}
                           </div>
                        </div>
                     </motion.div>
                  ) 
               ) : ( 
                  <div>Select a tab, no tab selected.</div>
               ))}
            </div>
         )}
         
         {/* Dialog Form for Adding a New Section */}
         <Dialog 
            open={openForm} 
            onClose={handleCloseForm} 
            fullWidth 
            maxWidth="md" // Adjust size (options: 'xs', 'sm', 'md', 'lg', 'xl')
            PaperProps={{ sx: { width: "80%", maxWidth: "600px" } }} // Custom width
         >
            <DialogTitle sx={{ fontWeight: "bold" }}>Add New Section</DialogTitle>
            <DialogContent>
               <div className="flex flex-col gap-6 p-4">
                  {error && <Typography color="error">{error}</Typography>}
                  
                  {/* Section Number */}
                  <TextField
                     label="Section Number"
                     variant="outlined"
                     value={selectedSectionNumber}
                     onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or alphanumeric strings up to 5 chars
                        if (value === '' || (value.length <= 5 && /^[a-zA-Z0-9]*$/.test(value))) {
                           setSelectedSectionNumber(value);
                        }
                     }}
                     error={
                        selectedSectionNumber === '' || // Empty field error
                        existingSectionNumbers.includes(selectedSectionNumber.toUpperCase()) || // Duplicate error
                        !/^[a-zA-Z0-9]{1,5}$/.test(selectedSectionNumber) // Invalid format error
                     }
                     onBlur={() => {
                        // Convert to uppercase and validate for duplicates
                        const upperValue = selectedSectionNumber.toUpperCase();
                        if (selectedSectionNumber !== '' && existingSectionNumbers.includes(upperValue)) {
                           alert(`Section number ${upperValue} already exists!`);
                           setSelectedSectionNumber('');
                        } else if (selectedSectionNumber !== '') {
                           // Auto-uppercase the value on blur
                           setSelectedSectionNumber(upperValue);
                        }
                     }}
                     fullWidth
                     helperText={
                        selectedSectionNumber === '' // If there's nothing entered, tell the user to enter something
                           ? "You must have a section number!"
                           : (existingSectionNumbers.includes(selectedSectionNumber.toUpperCase()))
                              ? "This section number already exists!"
                              : "Enter 1-5 alphanumeric characters (e.g., '01' or 'R01')"
                     }
                     sx={{
                           '& input': {
                           textTransform: 'uppercase',
                           },
                        }}
                     slotProps={{
                        input: {
                        maxLength: 5,
                        },
                     }}
                  />
                  
                  {/* Semester */}
                  <FormControl fullWidth error={!selectedSemester}>
                     <InputLabel id="semester-label">Semester</InputLabel>
                     <Select
                        labelId="semester-label"
                        name="semester"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                     >
                        {semesters.map((sem) => (
                           <MenuItem key={sem.semester_id} value={sem}>
                              {sem.designation}
                           </MenuItem>
                        ))}
                     </Select>
                     {!selectedSemester && (
                        <FormHelperText>Semester is required.</FormHelperText>
                     )}
                  </FormControl>
                  
                  {/* CRN Input */}
                  <TextField
                     label="CRN"
                     variant="outlined"
                     value={selectedCRN}
                     onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,5}$/.test(value)) setSelectedCRN(value);
                     }}
                     fullWidth
                     error={
                        selectedCRN.length === 0 || (selectedCRN.length > 0 && selectedCRN.length !== 5)
                     }
                     helperText={
                        selectedCRN.length === 0
                           ? 'CRN is required.'
                           : selectedCRN.length !== 5
                           ? 'CRN must be exactly 5 digits.'
                           : ''
                     }
                  />
                  
                  <Autocomplete
                     options={instructors}
                     getOptionLabel={(option) => {
                        if (!option || typeof option !== 'object') return '';
                        return `${option.first_name ?? ''} ${option.last_name ?? ''}`.trim();
                     }}                     
                     fullWidth
                     disabled={!isUserAdmin}
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label="Instructor"
                           error={selectedInstructor === null || selectedInstructor === ''}
                           helperText={
                              selectedInstructor === null || selectedInstructor === ''
                                 ? "Please select an instructor."
                                 : ""
                           }
                        />
                     )}
                     value={selectedInstructor}
                     onChange={(event, newValue) => setSelectedInstructor(newValue)}
                  />
                  
                  <div className="flex gap-x-4 justify-between items-center">
                     <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleAddSection}
                        disabled={!selectedCRN || !selectedInstructor || !selectedSemester || !selectedSectionNumber}
                     >
                        Add Section
                     </Button>
                     <Button variant="outlined" color="error" onClick={handleCloseForm}>
                        Cancel
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}

export default SpecificCourseInformation;
