import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import { USER } from "../constants";
import SpecificSectionInformation from "../components/SpecificSectionPage/SpecificSectionInformation";


function SpecificSection() {
   const { sectionId } = useParams();
   let courseId = null; // Used to query backend for the course for the given section
   const [currentUser, setCurrentUser] = useState(null);
   const [course, setCourse] = useState({});
   const [programs, setPrograms] = useState([]);
   const [programCourseMappings, setProgramCourseMappings] = useState([]);
   const [section, setSection] = useState({});
   const [semesters, setSemesters] = useState([]); // Used to populate information for the form to create a new section
   // NOTE: The view from the backend disallows non-super users from GET calling all users, therefore the GET call will only return the current user
   const [instructor, setInstructor] = useState(null); 
   const [loading, setLoading] = useState(true); // State to track loading status
   
   
   const getUserData = async () => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         setCurrentUser(userData || null);
      } catch (error) {
         console.error("Error loading user from localStorage:", error);
         setCurrentUser(null);
      }
   };
   
   const getSection = async () => {
      try {
         const res = await api.get(`/api/sections/${sectionId}`);
         setSection(res.data); 
         if (res.data?.course) {
            courseId = res.data.course;  // Set the courseId for fetching the course
         }
      } catch (err) {
         alert(`Error fetching Section: ${err.message}`);
      }
   };   
   
   const getCourse = async () => {
      if (courseId != null) {
         try {
            const res = await api.get(`/api/courses/${courseId}`);
            setCourse(res.data);
         } catch (err) {
            alert(`Error fetching course: ${err.message}`);
         }
      } else {
         console.log("Course ID is null, cannot fetch!");
      }
      console.log("Course: ", course);
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
   
   const getSemesters = async () => {
      try {
         const res = await api.get('/api/semesters/');
         setSemesters(res.data);
      } catch (err) {
         alert(`Error fetching Semesters: ${err.message}`);
      }
   };
   
   const getInstructor = async () => {
      try {
         const res = await api.get('/api/users/');
         setInstructor(res.data);
      } catch (err) {
         alert(`Error fetching Instructor: ${err.message}`);
      }
   };
   
   useEffect(() => { // Program <-> Course Mapping Handling
      if (!loading && course.course_id && programs.length > 0 && programCourseMappings.length > 0) {
         console.log("Course: ", course);
         console.log("Programs: ", programs);
         console.log("Program Course Mappings: ", programCourseMappings);
         
         const programLookup = programs.reduce((acc, program) => {
            acc[program.program_id] = program.designation;
            return acc;
         }, {});
         
         const mapping = programCourseMappings.find(mapping => mapping.course === course.course_id);
         const foundProgramName = mapping ? programLookup[mapping.program] || "Unknown Program" : "No Program Assigned";
         
         setCourse(prev => ({ ...prev, program_name: foundProgramName }));
      }
   }, [loading, programCourseMappings, programs, course.course_id]);
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getUserData();
         await getSection();
         await getCourse();
         await getProgramCourseMappings();
         await getSemesters();
         await getInstructor();
         await getPrograms();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
      console.log("Section: ", section);
   }, []);
   
   
   // HTML Stuff
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="flex flex-col items-left text-left w-[60%]">
            <div className="flex flex-row gap-x-4">
               <h1 className="font-bold text-3xl">{loading ? "Loading..." : course?.name || "N/A"}</h1>
               <p className="font-bold text-3xl">—</p>
               <h1 className="font-bold text-3xl">{section?.section_number}</h1>
            </div>
            <h2 className="font-semi-bold text-2xl">{loading ? "Loading..." : `${course?.program_name || "N/A"} ${course?.course_number || ""}`} ｜ {loading ? "Loading..." : `${course.a_version_details?.a_organization.name || ""} (${course.a_version_details?.year || ""})`}</h2>
            <h3 className="font-semi-bold text-md">Semester: {section?.semester_details?.designation}</h3>
            <h3 className="font-semi-bold text-md">Instructor: {section?.instructor_details?.last_name}</h3>
         </div>
         
         <div className="flex flex-col items-center w-[70%]" /* Render SpecificCourseInformation only when data is available */ >
            {!loading && instructor ? (
               <SpecificSectionInformation />
            ) : (
               <p>Loading instructor data...</p> 
            )}
         </div>
      </div>
   );
}

export default SpecificSection;
