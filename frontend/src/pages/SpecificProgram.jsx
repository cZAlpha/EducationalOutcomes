import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api';
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from '@mui/icons-material/School';

function SpecificProgram() {
   const { programId } = useParams();
   const [program, setProgram] = useState({});
   const [courses, setCourses] = useState([]);
   const [programCourseMappings, setProgramCourseMappings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showFullDescription, setShowFullDescription] = useState(false);
   
   const getProgram = async () => {
      try {
         const res = await api.get(`/api/programs/${programId}/`);
         setProgram(res.data);
      } catch (err) {
         alert(`Error fetching program: ${err.message}`);
      }
   };
   
   const getCourses = async () => {
      try {
         const res = await api.get('/api/courses/');
         setCourses(res.data);
      } catch (err) {
         alert(`Error fetching courses: ${err.message}`);
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
   
   useEffect(() => {
      const fetchData = async () => {
         await getProgram();
         await getCourses();
         await getProgramCourseMappings();
         setLoading(false);
      };
      
      fetchData();
   }, [programId]);
   
   
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         {/* Header Section */}
         <div className="flex flex-col items-left text-left w-full md:w-[60%]">
            <motion.h1
               className="italic text-xl mb-2"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               Program
            </motion.h1>
            
            <motion.h1
               className="font-bold text-3xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : `${program.designation}`}
            </motion.h1>
            
            <motion.div
               className="mt-4"
               initial={{ opacity: 0 }}
               animate={{ opacity: loading ? 0 : 1 }}
               transition={{ duration: 0.5 }}
            >
               {loading ? "Loading..." : program?.description ? 
                  showFullDescription ? 
                  program.description : 
                  program.description.length > 200 ? 
                  `${program.description.slice(0, 200)}...` : 
                  program.description
                  : "No description available"
               }
            </motion.div>
            
            {program?.description && program.description.length > 200 && (
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
                     sx={{ minWidth: '140px' }}
                  >
                  {showFullDescription ? "Show Less" : "Show More"}
                  </Button>
               </motion.div>
            )}
         </div>
         
         {/* Information Section - Add your program-specific components here */}
         <motion.div
         className="flex flex-col items-center w-full md:w-[70%]"
         initial={{ opacity: 0 }}
         animate={{ opacity: loading ? 0 : 1 }}
         transition={{ duration: 0.5 }}
         >
         {!loading && (
            <div className="w-full bg-white p-6 rounded-lg shadow-md mb-6">
               <h2 className="text-2xl font-bold mb-4 text-left">Courses in this Program</h2>
               <p>Coming soon...</p>
            </div>
         )}
         </motion.div>
      </div>
   );
}

export default SpecificProgram;