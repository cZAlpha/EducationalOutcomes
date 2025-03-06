import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import { USER } from "../constants";
//import SpecificSectionInformation from "../components/SpecificSectionsPage/SpecificSectionInformation";


function SpecificSection() {
   const { sectionId } = useParams();
   let courseId = null; // Used to query backend for the course for the given section
   const [currentUser, setCurrentUser] = useState(null);
   const [course, setCourse] = useState({});
   const [programs, setPrograms] = useState([]);
   const [section, setSection] = useState([]);
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
      } catch (err) {
         alert(`Error fetching Sections: ${err.message}`);
      }
   };
   
   const getCourse = async () => {
      if (section.course) {
         try {
            const res = await api.get(`/api/courses/${section.course}`);
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
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getUserData();
         await getSection();
         await getCourse();
         await getSemesters();
         await getInstructor();
         await getPrograms();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
   }, []);
   
   
   // HTML Stuff
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="flex flex-col items-left text-left w-[60%]">
            <h1 className="font-bold text-3xl">{loading ? "Loading..." : course?.name || "N/A"} ｜ {loading ? "Loading..." : `${course?.program_name || "N/A"} ${course?.course_number || ""}`}</h1>
            <h2 className="font-semi-bold text-xl"></h2>
            <h2 className="font-semi-bold text-xl">
               Accreditation: {loading ? "Loading..." : `${course.a_version_details?.a_organization.name || ""} (${course.a_version_details?.year || ""})`}
            </h2>
            <h4>{loading ? "Loading..." : course?.description ? course.description.slice(0, 200) + "..." : "N/A"}</h4>
         </div>
         
         <div className="flex flex-col items-center w-[70%]" /* Render SpecificCourseInformation only when data is available */ >
            {!loading && instructor ? (
               // <SpecificSectionInformation 
               //    course={course} 
               //    semesters={semesters} 
               //    instructor={instructor} 
               //    sections={sections} 
               //    CLOs={CLOs} 
               //    PLOs={PLOs} 
               //    PLOCLOMappings={PLOCLOMappings} 
               // />
               <div> Placeholder for SpecificSectionInformation Component </div>
            ) : (
               <p>Loading instructor data...</p> 
            )}
         </div>
      </div>
   );
}

export default SpecificSection;
