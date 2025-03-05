import React, { useEffect, useState } from "react";
import FilterSectionsBar from "../components/SectionsPage/FilterSectionsBar";
import SectionsTable from "../components/SectionsPage/SectionsTable";
import { Tooltip, IconButton } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import api from '../api';
import { USER } from "../constants";


const Sections = () => {
   // START - Variables
   const [sections, setSections] = useState([]); // Stores all sections in an array
   const [filters, setFilters] = useState({ // Stores all active filters
      search: "",
      sectionType: "All Sections",
      recordsPerPage: 5,
   });
   // STOP  - Variables

   // START - Section data fetching
   const getSections = async () => {
      try {
         const res = await api.get('/api/sections/');
         setSections(res.data);
      } catch (err) {
         alert(`Error fetching Sections: ${err.message}`);
      }
   };
   // STOP  - Section data fetching
   
   // START - Filtering
   const handleFilterChange = ({ search, filter, records }) => {
      setFilters((prev) => ({
         ...prev,
         search: search ?? prev.search,
         sectionType: filter ?? prev.sectionType,
         recordsPerPage: records ?? prev.recordsPerPage,
      }));
   };
   
   // ON FILTER CHANGE CALLS
   useEffect(() => { 
      const applyFilters = () => {
         let updatedSections = [...sections];
         
         // Search filter
         if (filters.search.trim()) {
            updatedSections = updatedSections.filter((section) =>
               section.sectionName.toLowerCase().includes(filters.search.toLowerCase())
            );
         }
         
         // Section type filter
         switch (filters.sectionType) {
            case "Active Sections":
               updatedSections = updatedSections.filter((section) => !section.dateRemoved);
               break;
            case "Removed Sections":
               updatedSections = updatedSections.filter((section) => section.dateRemoved);
               break;
            case "Current Sections":
               const currentYear = new Date().getFullYear();
               updatedSections = updatedSections.filter(
               (section) => !section.dateRemoved || new Date(section.dateRemoved).getFullYear() >= currentYear
               );
               break;
            default:
               break;
         }
         
         setSections(updatedSections);
      };
      
      applyFilters();
   }, [filters]);
   // STOP  - Filtering
   
   // START - Refresh handling from FilterSectionsBar component
   const handleRefresh = () => {
      getSections();
   };
   // STOP  - Refresh handling from FilterSectionsBar component
   
   // START - ON MOUNT FUNCTION CALLS
   useEffect(() => {
      const fetchData = async () => { // Defining the function here
         await getSections();
      };
      
      fetchData(); // But call it here
   }, []);
   // STOP - ON MOUNT FUNCTION CALLS
   
   
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div /* HeaderContent: Title, Help Button*/ className="flex justify-between items-center w-[70%] pt-8">
            <h1 /*Title */ className="text-3xl font-bold">Sections</h1>
            
            {/* Help Button with Tooltip */}
            <Tooltip title="To add a section, find the corresponding course and add it through the courses page" arrow placement="left">
               <IconButton>
                  <HelpOutlineIcon />
               </IconButton>
            </Tooltip>
         </div>
         
         <div className="w-[70%]">
            <FilterSectionsBar onFilterChange={handleFilterChange} onRefresh={handleRefresh} />
         </div>
         
         <div>
            <SectionsTable sections={sections} sectionsPerPage={filters.recordsPerPage}/>
         </div>
      </div>
   );
};

export default Sections;
