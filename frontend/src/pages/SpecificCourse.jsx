import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import SpecificCourseInformation from "../components/SpecificCoursesPage/SpecificCourseInformation";
import { Button } from "@mui/material"; // MUI Button
import { motion } from "framer-motion";


function SpecificCourse() {
   const { courseId } = useParams();
   const [course, setCourse] = useState({});
   const [programs, setPrograms] = useState([]);
   const [programCourseMappings, setProgramCourseMappings] = useState([]);
   const [sections, setSections] = useState([]);
   const [semesters, setSemesters] = useState([]); // Used to populate information for the form to create a new section
   // NOTE: The view from the backend disallows non-super users from GET calling all users, therefore the GET call will only return the current user
   const [instructor, setInstructor] = useState(null); 
   const [CLOs, setCLOs] = useState([]);
   const [PLOs, setPLOs] = useState([]);
   const [PLOCLOMappings, setPLOCLOMappings] = useState([]);
   const [loading, setLoading] = useState(true); // State to track loading status
   const [showFullDescription, setShowFullDescription] = useState(false); // State for toggling description visibility
   
   const getCourse = async () => {
      try {
         const res = await api.get(`/api/courses/${courseId}`);
         setCourse(res.data);
      } catch (err) {
         alert(`Error fetching course: ${err.message}`);
      }
   };
   
   const getPrograms = async () => {
      try {
         const res = await api.get('/api/programs/');
         setPrograms(res.data);
      } catch (err) {
         alert(`Error fetching Programs: ${err.message}`);
      }
   };
   
   const getProgramCourseMappings = async () => {
      try {
         const res = await api.get('/api/program-course-mappings/');
         setProgramCourseMappings(res.data);
      } catch (err) {
         alert(`Error fetching Program <-> Course Mappings: ${err.message}`);
      }
   };
   
   // START - Sections fetching and filtering
   const getSections = async () => {
      const filterSections = (unfilteredSections) => {
         return unfilteredSections.filter(section => section.course === parseInt(courseId));
      };  
      try {
         const res = await api.get('/api/sections/');
         setSections(filterSections(res.data)); // Filter then set sections
      } catch (err) {
         alert(`Error fetching Sections: ${err.message}`);
      }
   };
   // STOP  - Sections fetching and filtering
   
   const getSemesters = async () => {
      try {
         const res = await api.get('/api/semesters/');
         setSemesters(res.data);
      } catch (err) {
         alert(`Error fetching Semesters: ${err.message}`);
      }
   };
   
   // START - CLO fetching and filtering
   const getCLOs = async () => {
      const filterCLOs = (unfilteredCLOs) => {
         return unfilteredCLOs.filter(clo => clo.course === parseInt(courseId));
      };   
      try {
         const res = await api.get('/api/course-learning-objectives/');
         setCLOs(filterCLOs(res.data)); // Filter and then set the CLOs
      } catch (err) {
         alert(`Error fetching CLOs: ${err.message}`);
      }
   };
   // STOP  - CLO fetching and filtering
   
   // TODO: This is a sloppy way of handling this, should be changed in the future
   const getPLOs = async () => {
      try {
         const res = await api.get('/api/program-learning-objectives/');
         setPLOs(res.data);
      } catch (err) {
         alert(`Error fetching PLOs: ${err.message}`);
      }
   };
   
   // TODO: This is a sloppy way of handling this, should be changed in the future
   const getPLOCLOMappings = async () => {
      try {
         const res = await api.get('/api/plo-clo-mappings/');
         setPLOCLOMappings(res.data);
      } catch (err) {
         alert(`Error fetching PLO <-> CLO Mappings: ${err.message}`);
      }
   };
   
   useEffect(() => {
      const fetchData = async () => {
         await getProgramCourseMappings();
         await getCourse();
         await getSemesters();
         await getPrograms();
         await getSections();
         await getCLOs();
         await getPLOs();
         await getPLOCLOMappings();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
   }, []);
   
   useEffect(() => { // Program <-> Course Mapping Handling
      if (!loading && course.course_id && programs.length > 0 && programCourseMappings.length > 0) {         
         const programLookup = programs.reduce((acc, program) => {
            acc[program.program_id] = program.designation;
            return acc;
         }, {});
         
         const mapping = programCourseMappings.find(mapping => mapping.course === course.course_id);
         const foundProgramName = mapping ? programLookup[mapping.program] || "Unknown Program" : "No Program Assigned";
         
         setCourse(prev => ({ ...prev, program_name: foundProgramName }));
      }
   }, [loading, programCourseMappings, programs, course.course_id]);
   
   useEffect(() => { // PLO <-> CLO Mapping Handling
      if (!loading && CLOs.length > 0 && PLOs.length > 0 && PLOCLOMappings.length > 0) {         
         const mappedCLOs = CLOs.map(clo => ({
            ...clo,
            mappedPLOs: PLOCLOMappings
               .filter(mapping => mapping.clo_id === clo.clo_id)
               .map(mapping => PLOs.find(plo => plo.plo_id === mapping.plo_id))
               .filter(plo => plo) // Remove undefined values
         }));
         setCLOs(mappedCLOs);
      }
   }, [loading, PLOs, PLOCLOMappings, CLOs.clo_id]);
   
   
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         {/* Header Section */}
         <div className="flex flex-col items-left text-left w-full md:w-[60%]">
            {/* Page Title (Shown on both mobile and desktop) */}
            <motion.h1
               className="italic text-xl mb-2"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               Course
            </motion.h1>
            
            {/* Mobile Course Info. Section*/}
            <motion.h1
               className="block md:hidden font-bold text-3xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : course?.name || "N/A"}
            </motion.h1>
            <motion.h2
               className="block md:hidden font-bold text-2xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : `${course?.program_name || "N/A"} ${course?.course_number || ""}`}
            </motion.h2>
            
            {/* Desktop Course Info. Section*/}
            <motion.h1
               className="hidden md:block font-bold text-3xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : course?.name || "N/A"} ｜ {loading ? "Loading..." : `${course?.program_name || "N/A"} ${course?.course_number || ""}`}
            </motion.h1>
            <motion.h2
               className="font-semi-bold text-xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               Accreditation: {loading ? "Loading..." : `${course.a_version_details?.a_organization.name || ""} (${course.a_version_details?.year || ""})`}
            </motion.h2>
            <motion.h3
               className="font-semi-bold text-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               Date Added: {course.date_added}
            </motion.h3>
            {course.date_removed && 
               <motion.h3
                  className="text-red-600 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loading ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
               >
                  Date Removed: {course.date_removed}
               </motion.h3>               
            }
            <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loading ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : course?.description ? 
                  showFullDescription ? 
                     course.description : 
                     course.description.length > 200 ? 
                     `${course.description.slice(0, 200)}...` : 
                     course.description
                  : "N/A"
               }
            </motion.h4>
            {course?.description && course.description.length > 200 && (
               <motion.div
                  className="flex justify-center w-full mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loading ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
               >
                  <Button 
                     variant="outlined" 
                     color="black" 
                     onClick={() => setShowFullDescription(prev => !prev)}
                     sx={{
                        minWidth: '140px',
                        maxWidth: '160px'
                     }}
                  >
                     {showFullDescription ? "Show Less" : "Show More"}
                  </Button>
               </motion.div>
            )}
         </div>
         
         {/* Information Section */}
         <motion.div
            className="flex flex-col items-center w-full md:w-[70%]" /* Render SpecificCourseInformation only when data is available */
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.5 }}
         >
            {!loading && (
               <SpecificCourseInformation 
                  course={course} 
                  semesters={semesters} 
                  sections={sections} 
                  CLOs={CLOs} 
                  PLOs={PLOs} 
                  PLOCLOMappings={PLOCLOMappings} 
               />
            )}
         </motion.div>
      </div>
   );
}

export default SpecificCourse;
