import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import { USER } from "../constants";


function SpecificCourse() {
   const { courseId } = useParams();

   // START - Variables
   const [currentUser, setCurrentUser] = useState(null); // Stores the user object
   
   const [courses, setCourses] = useState([]); // Used to store the courses fetched from the api call
   const [programs, setPrograms] = useState([]); // Used to store the programs fetched  from the api call
   const [programCourseMappings, setProgramCourseMappings] = useState([]); // Used to store the Program <-> Course Mappings from the api call
   const [sections, setSections] = useState([]); // Array used to store sections fetched from api
   
   const [filters, setFilters] = useState({ // Stores all active filters
      search: "",
      courseType: "All Courses",
      recordsPerPage: 5,
   });
   // STOP  - Variables
   
   // START - User Data Fetching
   const getUserData = () => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         if (userData) {
            setCurrentUser(userData);
         } else {
            setCurrentUser(null);
         }
      } catch (error) {
         console.error("Account Component | Error loading user from localStorage:", error);
         setCurrentUser(null);
      }
   };
   // STOP  - User Data Fetching

   // START - Course Data Fetching
   const getCourses = () => {
      api
         .get('/api/courses/')
         .then((res) => setCourses(res.data))
         .catch((err) => alert(`Error fetching courses: ${err.message}`));
   };
   // STOP  - Course Data Fetching   

   // START - Program Data Fetching
   const getPrograms = () => {
      api
         .get('/api/programs/')
         .then((res) => setPrograms(res.data))
         .catch((err) => alert(`Error fetching Programs: ${err.message}`));
   };
   // STOP  - Program Data Fetching

   // START - Program Course Mapping Data Fetching
   const getProgramCourseMappings = () => {
      api
         .get('/api/program-course-mappings/')
         .then((res) => setProgramCourseMappings(res.data))
         .catch((err) => alert(`Error fetching Program <-> Course Mappings: ${err.message}`));
   };
   // STOP  - Program Course Mapping Data Fetching

   // START - Section Data Fetching
   const getSections = () => {
      api
         .get('/api/sections/')
         .then((res) => setSections(res.data))
         .catch((err) => alert(`Error fetching Sections: ${err.message}`));
   }
   
   // START - Filtering 
   const handleFilterChange = ({ search, filter, records }) => {
      setFilters((prev) => ({
         ...prev,
         search: search ?? prev.search,
         courseType: filter ?? prev.courseType,
         recordsPerPage: records ?? prev.recordsPerPage,
      }));
   };
   
      // ON FILTER CHANGE CALLS
   useEffect(() => { 
      const applyFilters = () => {
         let updatedCourses = [...courses];
         
         // Search filter
         if (filters.search.trim()) {
            updatedCourses = updatedCourses.filter((course) =>
               course.courseName.toLowerCase().includes(filters.search.toLowerCase())
            );
         }
         
         // Course type filter
         switch (filters.courseType) {
            case "Active Courses":
               updatedCourses = updatedCourses.filter((course) => !course.dateRemoved);
               break;
            case "Removed Courses":
               updatedCourses = updatedCourses.filter((course) => course.dateRemoved);
               break;
            case "Current Courses":
               const currentYear = new Date().getFullYear();
               updatedCourses = updatedCourses.filter(
               (course) => !course.dateRemoved || new Date(course.dateRemoved).getFullYear() >= currentYear
               );
               break;
            default:
               break;
         }
         
         setCourses(updatedCourses);
      };
      
      applyFilters();
   }, [filters]);
   // STOP  - Filtering 

   // CONSOLE LOGGING AND MAPPING OF PROGRAMS ONTO COURSES
   useEffect(() => {
      if (courses.length > 0) {
         console.log("Courses: ", courses);
      }
      if (programs.length > 0) {
         console.log("Programs: ", programs);
      }
      if (programCourseMappings.length > 0) {
         console.log("Program Course Mappings: ", programCourseMappings);
      }
      if (sections.length > 0) {
         console.log("Sections:", sections);
      }
   
      // Ensure courses and programCourseMappings are available
      if (courses.length > 0 && programCourseMappings.length > 0) {
         // Create a lookup object for program names by ID
         const programLookup = programs.reduce((acc, program) => {
            acc[program.program_id] = program.designation;
            return acc;
         }, {});

         // Map courses and replace program IDs with program names
         const updatedCourses = courses.map(course => {
            const mapping = programCourseMappings.find(mapping => mapping.course === course.course_id);
            return {
               ...course,
               program_name: mapping ? programLookup[mapping.program] || "Unknown Program" : "No Program Assigned"
            };
         });
         setCourses(updatedCourses); // Update courses
         console.log("Updated Courses with Program Names: ", updatedCourses);
      }
         
   }, [programCourseMappings, programs, sections]) // If Courses or Programs or ProgramCourseMappings Change, this will trigger
   
   // ON MOUNT FUNCTION CALLS
   useEffect(() => { // On component mount, call all functions within this 
      getUserData(); // Gets user data from local storage (NEEDS TO BE CHANGED TO AN AUTH CONTEXT)
      getProgramCourseMappings();
      getCourses(); // Fetches courses from the backend through the api
      getPrograms(); // Fetches programs
      getSections(); // Fetches sections
   }, []);

   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="flex flex-col items-left text-left w-[60%]">
            <h1 className="font-bold text-3xl">Course Name | Program Name - Course Number</h1>
            <h2 className="font-semi-bold text-xl">Accreditation Org Name (v version year)</h2>
            <h4>Course Description</h4>
         </div>

         <div className="flex bg-white w-[60%]">
            placeholder
         </div>
      </div>
   );
}

export default SpecificCourse;
