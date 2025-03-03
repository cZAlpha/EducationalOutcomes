import React, { useState } from "react";
import SpecificCoursesSectionCard from "./SpecificCoursesSectionCard";
import { IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


function SpecificCourseInformation({ sections, CLOs, PLOs, PLOCLOMappings }) {
   const [selectedTab, setSelectedTab] = useState("Sections");
   const [extraSections, setExtraSections] = useState([]); // Keeps track of added sections
   const [openForm, setOpenForm] = useState(false);
   const [formData, setFormData] = useState({
      course_name: "",
      section_number: "",
      semester: "",
      crn: "",
      instructor: "",
   });
   
   const [expandedCLO, setExpandedCLO] = useState(null); // State to track which CLO is expanded
   
   // Create a mapping of CLOs to their corresponding PLOs
   const cloToPloMap = CLOs.reduce((acc, clo) => {
      acc[clo.clo_id] = PLOCLOMappings
      .filter((mapping) => mapping.clo === clo.clo_id)
      .map((mapping) => PLOs.find((plo) => plo.plo_id === mapping.plo));
      return acc;
   }, {});
   
   const handleOpenForm = () => setOpenForm(true);
   const handleCloseForm = () => setOpenForm(false);
   
   const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };
   
   const handleAddSection = () => {
      if (formData.course_name && formData.section_number && formData.semester && formData.crn && formData.instructor) {
         setExtraSections([...extraSections, formData]);
         setFormData({ course_name: "", section_number: "", semester: "", crn: "", instructor: "" });
         handleCloseForm();
      }
   };

   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="flex justify-between mb-4 gap-x-4">
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
         <div className="p-4 border rounded-md bg-gray-100 min-h-[200px]">
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
                              course={section.course.name} 
                              section_number={section.section_number}
                              semester={section.semester.designation} 
                              crn={section.crn}
                              instructor={section.instructor ? `${section.instructor.last_name}` : "N/A"}
                           />
                        ))}
                        {extraSections.map((section, index) => (
                           <SpecificCoursesSectionCard
                              key={`extra-${index}`}
                              course_name={section.course_name}
                              section_number={section.section_number}
                              semester={section.semester}
                              crn={section.crn}
                              instructor={section.instructor}
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
         <Dialog open={openForm} onClose={handleCloseForm}>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogContent>
               <div className="flex flex-col gap-4 p-4">
                  <TextField label="Course Name" name="course_name" value={formData.course_name} onChange={handleInputChange} fullWidth />
                  <TextField label="Section Number" name="section_number" value={formData.section_number} onChange={handleInputChange} fullWidth />
                  <TextField label="Semester" name="semester" value={formData.semester} onChange={handleInputChange} fullWidth />
                  <TextField label="CRN" name="crn" value={formData.crn} onChange={handleInputChange} fullWidth />
                  <TextField label="Instructor" name="instructor" value={formData.instructor} onChange={handleInputChange} fullWidth />
                  <Button variant="contained" color="primary" onClick={handleAddSection}>
                     Add Section
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}

export default SpecificCourseInformation;
