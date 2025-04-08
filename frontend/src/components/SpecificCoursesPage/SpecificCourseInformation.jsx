import React, { useEffect, useState } from "react";
import SpecificCoursesSectionCard from "./SpecificCoursesSectionCard";
import { IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from '../../api';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from "../AuthProvider";


function SpecificCourseInformation({ course, semesters, instructor, sections, CLOs, PLOs, PLOCLOMappings }) {
   const { user } = useAuth();
   const [isUserAdmin, setIsUserAdmin] = useState(false);
   const navigate = useNavigate(); // For navigating to specific section page
   const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false); // To track archive course modal visibility
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To track delete course modal visibility
   const [isReinstateModalOpen, setIsReinstateModalOpen] = useState(false); // Tracks if the reinstate course model is open
   const [selectedTab, setSelectedTab] = useState("Sections");
   const [extraSections, setExtraSections] = useState([]); // Keeps track of added sections
   const [openForm, setOpenForm] = useState(false);
   const [formData, setFormData] = useState({
      // NOTE: Course is omitted here due to being auto-set //
      section_number: "",
      semester: "", // This should be an object
      crn: "",
      instructor: "", // Autofill instructor
   });
   const [error, setError] = useState(""); // To gracefully display errors to the user
   
   const [expandedCLO, setExpandedCLO] = useState(null); // State to track which CLO is expanded
   const [coursePerformance, setCoursePerformance] = useState({}); // Obj to store the performance of the course
   const [loading, setLoading] = useState(true); // State to track loading status
   
   
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
      setFormData({
         section_number: "",
         semester: "",
         crn: "",
         instructor: instructor.length > 0 ? instructor[0] : null, // Autofill instructor object
      });
      setOpenForm(true);
   };
   
   const handleCloseForm = () => {
      setFormData({ section_number: "", semester: "", crn: "", instructor: "" }); // Remove all inputted data
      setError(""); // Remove any error before closing
      setOpenForm(false); // Close the form
   };
   
   const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };
   
   const handleAddSection = async () => {
      if (!formData.section_number || !formData.semester || !formData.crn || !formData.instructor) {
         setError("All fields are required.");
         return;
      }
      
      const newSection = {
         course: course.course_id,
         section_number: formData.section_number,
         semester: formData.semester.semester_id,
         crn: formData.crn,
         instructor: formData.instructor.user_id,
      };
      
      try {
         const res = await api.post('/api/sections/', newSection);
         setExtraSections([...extraSections, res.data]);
         setFormData({ section_number: "", semester: "", crn: "", instructor: "" });
         setError(""); // Clear error if successful
         handleCloseForm();
      } catch (err) {
         setError(err.response?.data?.message || "An error occurred while adding the section. Your input is incorrect. Section number must be an integer from 1-10. CRN can be no more than 20 characters.");
      }
   };
   
   const handleSectionClick = (sectionId) => { // Navigates to the given specific section page
      navigate(`/sections/${sectionId}`);
   };
   
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
   
   useEffect(() => {
      const fetchData = async () => {
         await getCoursePerformance();
         setLoading(false); // Set loading to false when all data is fetched
      };
      fetchData();
      findUserRole();
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
         {(!isArchiveModalOpen && !isDeleteModalOpen) && (
            <div className="w-full p-4 border rounded-md bg-gray-100 min-h-[200px]">
               {selectedTab === "Sections" ? (
                  <div>
                     <div className="flex justify-between items-center mb-4">
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
                  <div>
                     <h1 className="font-bold text-md mb-6">CLO Mappings</h1>
                     {CLOs.map((clo) => (
                     <Accordion key={clo.clo_id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <div className="flex flex-col gap-y-1">
                              <h4 className="font-bold text-lg">{`CLO ${clo.designation}`}</h4>
                              <p className="pl-4">{clo.description}</p>
                           </div>
                        </AccordionSummary>
                        <AccordionDetails>
                           {cloToPloMap[clo.clo_id]?.length > 0 ? (
                           <Card variant="outlined">
                              <CardContent>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                 Mapped PLOs:
                                 </Typography>
                                 <ul className="flex flex-col gap-y-1 text-left pt-2">
                                 {cloToPloMap[clo.clo_id].map((plo) => (
                                    <li key={plo.plo_id}>
                                       <Typography variant="body2">{`PLO ${plo.designation}: ${plo.description || "No description available"}`}</Typography>
                                    </li>
                                 ))}
                                 </ul>
                              </CardContent>
                           </Card>
                           ) : (
                           <Typography color="textSecondary">No mapped PLOs.</Typography>
                           )}
                        </AccordionDetails>
                     </Accordion>
                     ))}
                  </div>
               ) : selectedTab === "Performance" ? (
                  coursePerformance ? (
                     <>
                        <h1 className="font-bold text-md mb-6">Performance</h1>
                        <div className="w-full p-4 border bg-white rounded-lg shadow">
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
                        </div>
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
                              {(!isArchiveModalOpen && !isDeleteModalOpen) && isUserAdmin && (
                                 <>
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-[80%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Archive this Course?</p>
                                       {/* Archive Button */}
                                       <Button 
                                          color="error" 
                                          variant="contained"
                                          sx={{
                                             minWidth: '40px',
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
                                       <span className="mx-4 text-gray-400 text-sm">OR</span>
                                       <div className="flex-grow border-t border-gray-300"></div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-[80%] px-4 py-2 rounded-md">
                                       <p className="text-xl text-black">Delete this Course?</p>
                                       {/* Delete Button */}
                                       <Button 
                                          color="error" 
                                          variant="outlined"
                                          sx={{
                                             minWidth: '40px',
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
                  <TextField label="Section Number" name="section_number" value={formData.section_number} onChange={handleInputChange} fullWidth />
                  <FormControl fullWidth>
                     <InputLabel id="semester-label">Semester</InputLabel>
                     <Select
                        labelId="semester-label"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                     >
                        {semesters.map((sem) => (
                           <MenuItem key={sem.semester_id} value={sem}>
                           {sem.designation}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
                  <TextField label="CRN" name="crn" value={formData.crn} onChange={handleInputChange} fullWidth />
                  <TextField
                     label="Instructor"
                     fullWidth
                     disabled
                     value={instructor.length > 0 ? instructor[0].last_name : "N/A"}
                  />
                  <div className="flex gap-x-4 justify-between items-center">
                     <Button variant="contained" color="primary" onClick={handleAddSection}>
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
