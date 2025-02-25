import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import CourseCard from "./CourseCard";

const CoursesTable = ({ courses, coursesPerPage = 5 }) => {
   const [currentPage, setCurrentPage] = useState(1);

   const totalPages = Math.ceil(courses.length / coursesPerPage);
   const indexOfLastCourse = currentPage * coursesPerPage;
   const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
   const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

   const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
   };

   const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
   };

   return (
      <div className="w-full flex flex-col space-y-4">
         <div className="flex justify-center items-center space-x-4">
            <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
               <ArrowBack />
            </IconButton>
            <span>
               Page {currentPage} of {totalPages}
            </span>
            <IconButton
               onClick={handleNextPage}
               disabled={currentPage === totalPages}
            >
               <ArrowForward />
            </IconButton>
         </div>
         
         {currentCourses.map((course) => (
            <div key={course.course_id} className="w-full">
               <CourseCard {...course} />
            </div>
         ))}
         
         <div className="flex justify-center items-center space-x-4">
            <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
               <ArrowBack />
            </IconButton>
            <span>
               Page {currentPage} of {totalPages}
            </span>
            <IconButton
               onClick={handleNextPage}
               disabled={currentPage === totalPages}
            >
               <ArrowForward />
            </IconButton>
         </div>
      </div>
   );
};

export default CoursesTable;
