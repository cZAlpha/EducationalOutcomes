import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { USER } from "../constants";

function Courses() {
   const [currentUser, setCurrentUser] = useState(null);

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

   useEffect(() => {
      getUserData();
   }, []);

   return (
      <>
         <Navbar />
         <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%]">
            <div /* HeaderContent | Flex row for: Title, AddNewCourseButton*/ className="flex flex-row justify-between items-center w-[60%]">
               <h1 /*Title */ className="text-2xl font-bold">Courses</h1>
               <button>AddNewCourseButtonPlaceholder</button>
            </div>
            
            <div>
               FilterCoursesBar
            </div>
            
            
            <div>
               CoursesCardsTable
            </div>
         </div>
      </>
   );
}

export default Courses;
