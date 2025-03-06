import React, { useEffect, useState } from "react";
import AddCourseButton from "../components/CoursesPage/AddNewCourseButton";
import FilterCoursesBar from "../components/CoursesPage/FilterCoursesBar";
import CoursesTable from "../components/CoursesPage/CoursesTable";
import api from '../api';
import { USER } from "../constants";

function Courses() {
   // START - TESTING ONLY
   // const mockCourses = [
   //    {
   //       course_id: 0,
   //       courseName: "Introduction to Artificial Intelligence",
   //       programName: "CSCI",
   //       courseNumber: "302",
   //       accreditationOrganization: "ABET",
   //       accreditationVersion: "1.2",
   //       dateAdded: "2023-07-12",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 1,
   //       courseName: "Linear Algebra and Applications",
   //       programName: "MATH",
   //       courseNumber: "201",
   //       accreditationOrganization: "AMS",
   //       accreditationVersion: "2.1",
   //       dateAdded: "2023-02-18",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 2,
   //       courseName: "International Business Management",
   //       programName: "BUSN",
   //       courseNumber: "301",
   //       accreditationOrganization: "AACSB",
   //       accreditationVersion: "1.3",
   //       dateAdded: "2023-06-25",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 3,
   //       courseName: "Quantum Mechanics Fundamentals",
   //       programName: "PHYS",
   //       courseNumber: "301",
   //       accreditationOrganization: "APS",
   //       accreditationVersion: "3.4",
   //       dateAdded: "2022-10-03",
   //       dateRemoved: "2024-02-15",
   //    },
   //    {
   //       course_id: 4,
   //       courseName: "Macroeconomic Theory",
   //       programName: "ECON",
   //       courseNumber: "201",
   //       accreditationOrganization: "AACSB",
   //       accreditationVersion: "1.1",
   //       dateAdded: "2023-04-08",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 5,
   //       courseName: "Introduction to Computer Science",
   //       programName: "CSCI",
   //       courseNumber: "101",
   //       accreditationOrganization: "ABET",
   //       accreditationVersion: "1.0",
   //       dateAdded: "2023-01-10",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 6,
   //       courseName: "Data Structures and Algorithms",
   //       programName: "CSCI",
   //       courseNumber: "201",
   //       accreditationOrganization: "ABET",
   //       accreditationVersion: "1.1",
   //       dateAdded: "2023-03-15",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 7,
   //       courseName: "Advanced Calculus",
   //       programName: "MATH",
   //       courseNumber: "301",
   //       accreditationOrganization: "AMS",
   //       accreditationVersion: "2.0",
   //       dateAdded: "2022-09-05",
   //       dateRemoved: "2024-01-01",
   //    },
   //    {
   //       course_id: 8,
   //       courseName: "Principles of Economics",
   //       programName: "ECON",
   //       courseNumber: "101",
   //       accreditationOrganization: "AACSB",
   //       accreditationVersion: "1.0",
   //       dateAdded: "2023-05-20",
   //       dateRemoved: null,
   //    },
   //    {
   //       course_id: 9,
   //       courseName: "Modern Physics",
   //       programName: "PHYS",
   //       courseNumber: "401",
   //       accreditationOrganization: "APS",
   //       accreditationVersion: "3.2",
   //       dateAdded: "2022-11-10",
   //       dateRemoved: null,
   //    },
   // ];
   // STOP  - TESTING ONLY
   
   // START - Variables
   const [currentUser, setCurrentUser] = useState(null); // Stores the user object
   
   const [courses, setCourses] = useState([]); // Used to store the courses fetched from the api call
   const [programs, setPrograms] = useState([]); // Used to store the programs fetched  from the api call
   const [programCourseMappings, setProgramCourseMappings] = useState([]); // Used to store the Program <-> Course Mappings from the api call
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
      console.log("Courses: ", courses);
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
      console.log("Program Course Mappings: ", programCourseMappings);
   };
   // STOP  - Program Course Mapping Data Fetching
   
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
   
   // START - Refresh handling from FilterCoursesBar component
   const handleRefresh = () => {
      getProgramCourseMappings();
      getCourses(); // Fetches courses from the backend through the api
      getPrograms();
   };
   // STOP  - Refresh handling from FilterCoursesBar component
   
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
      
   }, [programCourseMappings, programs]) // If Courses or Programs or ProgramCourseMappings Change, this will trigger
   
   // ON MOUNT FUNCTION CALLS
   useEffect(() => { // On component mount, call all functions within this 
      getUserData(); // Gets user data from local storage (NEEDS TO BE CHANGED TO AN AUTH CONTEXT)
      getProgramCourseMappings();
      getCourses(); // Fetches courses from the backend through the api
      getPrograms();
   }, []);

   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div /* HeaderContent | Flex row for: Title, AddNewCourseButton*/ className="flex flex-row justify-between items-center w-[70%] pt-8">
            <h1 /*Title */ className="text-3xl font-bold">Courses</h1>
            <AddCourseButton/>
         </div>
         
         <div className="w-[70%]">
            <FilterCoursesBar onFilterChange={handleFilterChange} onRefresh={handleRefresh} />
         </div>
         
         <div className="min-w-[600px] text-left">
            <CoursesTable courses={courses} coursesPerPage={filters.recordsPerPage} />
         </div>
      </div>
   );
}

export default Courses;
