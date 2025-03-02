import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import { USER } from "../constants";
import SpecificCourseInformation from "../components/SpecificCoursesPage/SpecificCourseInformation";
import { use } from "react";


function SpecificCourse() {
   const { courseId } = useParams();

   const [currentUser, setCurrentUser] = useState(null);
   const [course, setCourse] = useState({});
   const [programs, setPrograms] = useState([]);
   const [programCourseMappings, setProgramCourseMappings] = useState([]);
   const [sections, setSections] = useState([]);
   const [learningObjectives, setLearningObjectives] = useState([]);
   const [loading, setLoading] = useState(true); // New state to track loading status

   const getUserData = () => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         setCurrentUser(userData || null);
      } catch (error) {
         console.error("Error loading user from localStorage:", error);
         setCurrentUser(null);
      }
   };

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

   const getSections = async () => {
      try {
         const res = await api.get('/api/sections/');
         setSections(res.data);
      } catch (err) {
         alert(`Error fetching Sections: ${err.message}`);
      }
   };

   useEffect(() => {
      const fetchData = async () => {
         await getUserData();
         await getProgramCourseMappings();
         await getCourse();
         await getPrograms();
         await getSections();
         setLoading(false); // Set loading to false when all data is fetched
      };

      fetchData();
   }, []);

   useEffect(() => {
      if (!loading && course.course_id && programs.length > 0 && programCourseMappings.length > 0) {
         console.log("Course: ", course);
         console.log("Programs: ", programs);
         console.log("Program Course Mappings: ", programCourseMappings);
         console.log("Sections:", sections);

         const programLookup = programs.reduce((acc, program) => {
            acc[program.program_id] = program.designation;
            return acc;
         }, {});

         const mapping = programCourseMappings.find(mapping => mapping.course === course.course_id);
         const foundProgramName = mapping ? programLookup[mapping.program] || "Unknown Program" : "No Program Assigned";

         setCourse(prev => ({ ...prev, program_name: foundProgramName }));
      }
   }, [loading, programCourseMappings, programs, course.course_id]);

   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="flex flex-col items-left text-left w-[60%]">
            <h1 className="font-bold text-3xl">{loading ? "Loading..." : course?.name || "N/A"} ｜ {loading ? "Loading..." : `${course?.program_name || "N/A"} ${course?.course_number || ""}`}</h1>
            <h2 className="font-semi-bold text-xl"></h2>
            <h2 className="font-semi-bold text-xl">
               Accreditation: {loading ? "Loading..." : `${course.a_version?.a_organization.name || ""} (${course.a_version?.year || ""})`}
            </h2>
            <h4>{loading ? "Loading..." : course?.description ? course.description.slice(0, 200) + "..." : "N/A"}</h4>
         </div>

         <div className="w-[60%]">
            <SpecificCourseInformation courseID={course.course_id || ""} sections={sections || []} learningObjectives={learningObjectives || []} />
         </div>
      </div>
   );
}

export default SpecificCourse;
