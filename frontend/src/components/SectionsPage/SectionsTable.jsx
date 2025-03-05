import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import SectionCard from "./SectionCard";
import { useNavigate } from "react-router-dom";


const SectionsTable = ({ sections, sectionsPerPage = 5 }) => {
   const navigate = useNavigate(); // For navigating to specific section page

   const [currentPage, setCurrentPage] = useState(1);

   const totalPages = Math.ceil(sections.length / sectionsPerPage);
   const indexOfLastSection = currentPage * sectionsPerPage;
   const indexOfFirstSection = indexOfLastSection - sectionsPerPage;
   const currentSections = sections.slice(indexOfFirstSection, indexOfLastSection);

   const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
   };

   const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
   };

   const handleSectionClick = (sectionId) => { // Navigates to the given specific section page
      navigate(`/sections/${sectionId}`);
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
         
         {currentSections.map((section) => (
            <div key={section.section_id} className="w-full" onClick={() => handleSectionClick(section.section_id)} style={{ cursor: "pointer" }}>
               <SectionCard {...section} />
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

export default SectionsTable;
