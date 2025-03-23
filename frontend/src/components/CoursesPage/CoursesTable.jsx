import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";


const CoursesTable = ({ courses, coursesPerPage = 5 }) => {
   const navigate = useNavigate(); // For navigating to specific course page
   
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
   
   const handleCourseClick = (courseId) => { // Navigates to the given specific course page
      navigate(`/courses/${courseId}`);
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
            <div key={course.course_id} className="w-full" onClick={() => handleCourseClick(course.course_id)} style={{ cursor: "pointer" }}>
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
