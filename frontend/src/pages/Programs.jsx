import LoadingIndicator from "../components/LoadingIndicator";
import React, { useEffect, useState } from "react";
import api from '../api';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, Box, IconButton, Tooltip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";


function Programs() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const [programs, setPrograms] = useState(null);
   const [programCourseMappings, setProgramCourseMappings] = useState([]);
   const [courses, setCourses] = useState([]);
   const [groupedCourses, setGroupedCourses] = useState({});
   
   const getPrograms = async () => {
      api
         .get('/api/programs/')
         .then((res) => setPrograms(res.data))
         .catch((err) => alert(`Error fetching Programs: ${err.message}`));
   };
   
   const getProgramCourseMappings = async () => {
      api
         .get('/api/program-course-mappings/')
         .then((res) => setProgramCourseMappings(res.data))
         .catch((err) => alert(`Error fetching Program <-> Course Mappings: ${err.message}`));
   };
   
   const getCourses = async () => {
      api
         .get('/api/courses/')
         .then((res) => setCourses(res.data))
         .catch((err) => alert(`Error fetching courses: ${err.message}`));
   };
   
   const handleProgramClick = (programId) => { // Navigates to the given specific program page
      navigate(`/programs/${programId}`);
   };
   
   const handleCourseClick = (courseId) => { // Navigates to the given specific course page
      navigate(`/courses/${courseId}`);
   };
   
   // Maps program names onto courses
   useEffect(() => {      
      if (courses.length > 0 && programCourseMappings.length > 0 && programs) {
         const programLookup = programs.reduce((acc, program) => {
         acc[program.program_id] = program.designation;
         return acc;
         }, {});
         
         const updatedCourses = courses.map(course => {
         const mapping = programCourseMappings.find(mapping => mapping.course === course.course_id);
         return {
            ...course,
            program_name: mapping ? programLookup[mapping.program] || "Unknown Program" : "No Program Assigned"
         };
         });
         setCourses(updatedCourses);
      }
   }, [programCourseMappings, programs]);
   
   // Organizes courses into active and archived
   useEffect(() => {
      if (programs && courses.length > 0) {
         const grouped = {};
         
         programs.forEach(program => {
            grouped[program.designation] = {
               programData: program,
               coursesByAccreditation: {} // New structure to group by accreditation
            };
         });
         
         courses.forEach(course => {
            if (course.program_name && grouped[course.program_name]) {
               const accreditationKey = course.a_version_details 
               ? `${course.a_version_details.a_organization_details.name} (${course.a_version_details.year})`
               : 'No Accreditation';
               
               if (!grouped[course.program_name].coursesByAccreditation[accreditationKey]) {
               grouped[course.program_name].coursesByAccreditation[accreditationKey] = {
                  activeCourses: [],
                  archivedCourses: []
               };
               }
               
               if (course.date_removed !== null) {
               grouped[course.program_name].coursesByAccreditation[accreditationKey].archivedCourses.push(course);
               } else {
               grouped[course.program_name].coursesByAccreditation[accreditationKey].activeCourses.push(course);
               }
            }
         });
         
         setGroupedCourses(grouped);
      }
   }, [courses, programs]);
   
   // On mount function calls
   useEffect(() => {
      const fetchData = async () => {
         await getProgramCourseMappings();
         await getPrograms();
         await getCourses();
         setLoading(false);
      };
      
      fetchData();
   }, []);
   
   
   if (loading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <LoadingIndicator />
         </Box>
      );
   }
   
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div /* HeaderContent: Title, Tooltip*/ className="flex justify-between items-center w-[90%] md:w-[70%] pt-8">
            <h1 className="text-3xl font-bold">Programs</h1>
            {/* Help Button with Tooltip */}
            <Tooltip
               title="This page displays all programs in the system, as well as all courses under each program organized by their active status."
               arrow
               placement="left"
               slotProps={{
                  tooltip: {
                     sx: {
                     backgroundColor: 'white',
                     color: 'black',
                     fontSize: '0.9rem',
                     borderRadius: '16px',  // Increased border radius for rounder corners
                     p: 1.5,
                     boxShadow: 3,
                     },
                  },
                  arrow: {
                     sx: {
                     color: 'white',
                     },
                  },
               }}
            >
               <IconButton>
                  <HelpOutlineIcon />
               </IconButton>
            </Tooltip>
         </div>
         
         <div className="w-[100%] md:w-[70%] space-y-6">
            {programs && programs.map((program) => (
               <div key={program.program_id} className="bg-white rounded-lg shadow-md p-6">
                  <button 
                     className="hover:bg-gray-100 rounded-md px-2 py-4 transition-colors"
                     onClick={() => handleProgramClick(program.program_id)}
                  >
                     <h1 className="text-xl font-bold text-left mb-2">
                        {program.designation}
                     </h1>
                     <p className="text-left mb-2 text-sm">
                        {program.description}
                     </p>
                  </button>
                  
                  {Object.entries(groupedCourses[program.designation]?.coursesByAccreditation || {}).map(
                     ([accreditation, {activeCourses, archivedCourses}]) => (
                     <div key={accreditation} className="mb-6">
                     <Typography variant="subtitle2" className="font-medium text-gray-600 mb-2">
                        {accreditation}
                     </Typography>
                     
                     <Accordion className="mt-2">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Typography variant="subtitle1" className="font-medium">
                           Active Courses ({activeCourses.length || 0})
                           </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                           {activeCourses.length > 0 ? (
                           <List>
                              {activeCourses.map((course) => (
                                 <ListItem 
                                 key={course.course_id} 
                                 button 
                                 onClick={() => handleCourseClick(course.course_id)}
                                 >
                                 <ListItemText
                                    primary={`${course.course_number}: ${course.name}`}
                                    secondary={course.description.slice(0,100) + "..."}
                                 />
                                 </ListItem>
                              ))}
                           </List>
                           ) : (
                           <Typography variant="body2" color="textSecondary">
                              No active courses for this accreditation
                           </Typography>
                           )}
                        </AccordionDetails>
                     </Accordion>

                     <Accordion className="mt-2">
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Typography variant="subtitle1" className="font-medium">
                           Archived Courses ({archivedCourses.length || 0})
                           </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                           {archivedCourses.length > 0 ? (
                           <List>
                              {archivedCourses.map((course) => (
                                 <ListItem 
                                 key={course.course_id} 
                                 button 
                                 onClick={() => handleCourseClick(course.course_id)}
                                 >
                                 <ListItemText
                                    primary={`${course.course_number}: ${course.name}`}
                                    secondary={
                                       <>
                                       {course.description.slice(0,100)}...
                                       <br />
                                       <span className="text-red-500">
                                          Archived on: {new Date(course.date_removed).toLocaleDateString()}
                                       </span>
                                       </>
                                    }
                                 />
                                 </ListItem>
                              ))}
                           </List>
                           ) : (
                           <Typography variant="body2" color="textSecondary">
                              No archived courses for this accreditation
                           </Typography>
                           )}
                        </AccordionDetails>
                     </Accordion>
                     </div>
                  ))}
               </div>
            ))}
         </div>
      </div>
   );
}

export default Programs;