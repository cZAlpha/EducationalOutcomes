import React, { useEffect, useState } from "react";
import SpecificCoursesSectionCard from "./SpecificCoursesSectionCard";
import { IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from '../../api';


function SpecificCourseInformation({ course, semesters, instructor, sections, CLOs, PLOs, PLOCLOMappings }) {
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
   
   useEffect(() => { // Program <-> Course Mapping Handling
      console.log("PROPS Instructor: ", instructor);
      console.log("PROPS Semesters: ", semesters);
   }, []);
   
   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="w-full flex justify-between mb-4 gap-x-4">
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "Sections" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("Sections")}
            >
               Sections
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "CLO Mappings" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("CLO Mappings")}
            >
               CLO Mappings
            </button>
         </div>
         
         {/* Display Section */}
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
                           <SpecificCoursesSectionCard
                              key={`existing-${index}`}
                              course={section.course_details.name} 
                              section_number={section.section_number}
                              semester={section.semester_details.designation} 
                              crn={section.crn}
                              instructor={section.instructor_details ? `${section.instructor_details.last_name}` : "N/A"}
                           />
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
            ) : (
               <div>
                  {CLOs.map((clo) => (
                  <Accordion key={clo.clo_id}>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{`CLO ${clo.designation}: ${clo.description}`}</Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        {cloToPloMap[clo.clo_id]?.length > 0 ? (
                        <Card variant="outlined">
                           <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                              Mapped PLOs:
                              </Typography>
                              <ul>
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
            )}
         </div>
         
         
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
                     <Button variant="contained" color="error" onClick={handleCloseForm}>
                        Cancel
                     </Button>
                     <Button variant="contained" color="primary" onClick={handleAddSection}>
                        Add Section
                     </Button>
                  </div>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}

export default SpecificCourseInformation;
