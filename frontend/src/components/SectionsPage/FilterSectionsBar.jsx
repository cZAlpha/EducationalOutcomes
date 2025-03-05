import React, { useState, useRef } from "react";
import { TextField, MenuItem, Select, InputLabel, FormControl, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { motion, useAnimation } from "framer-motion";


const FilterSectionsBar = ({ onFilterChange, onRefresh }) => {
   const [searchText, setSearchText] = useState("");
   const [sectionFilter, setSectionFilter] = useState("All Sections");
   const [recordsPerPage, setRecordsPerPage] = useState(5);
   const controls = useAnimation();
   const refreshButtonRef = useRef(null);
   
   const handleSearchChange = (event) => {
      const value = event.target.value;
      setSearchText(value);
      triggerFilterChange(value, sectionFilter, recordsPerPage);
   };
   
   const handleSectionFilterChange = (event) => {
      const value = event.target.value;
      setSectionFilter(value);
      triggerFilterChange(searchText, value, recordsPerPage);
   };
   
   const handleRecordsPerPageChange = (event) => {
      const value = event.target.value;
      setRecordsPerPage(value);
      triggerFilterChange(searchText, sectionFilter, value);
   };
   
   const triggerFilterChange = (search, filter, records) => {
      if (onFilterChange) {
         onFilterChange({ search, filter, records });
      }
   };
   
   const handleRefresh = async () => {
      if (onRefresh) {
         // Start the rotation animation
         await controls.start({
         rotate: 360,
         transition: { duration: 0.5, ease: "easeInOut" },
         });
         
         // Reset the rotation after the animation completes
         await controls.start({ rotate: 0, transition: { duration: 0 } });
         
         onRefresh(); // Notifies parent to refresh the API call
      }
   };
   
   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.5 }}
         className="flex flex-col md:flex-row items-center gap-4 bg-white rounded-2xl shadow-lg p-4 w-full"
      >
         <TextField
            label="Search Sections"
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            sx={{ width: "100%" }}
         />
         
         <FormControl sx={{ minWidth: 160, width: "100%", maxWidth: "16rem" }}>
            <InputLabel>Section Filter</InputLabel>
            <Select
               value={sectionFilter}
               onChange={handleSectionFilterChange}
               label="Section Filter"
            >
               <MenuItem value="All Sections">All Sections</MenuItem>
               <MenuItem value="Current Sections">Current Sections</MenuItem>
               <MenuItem value="Active Sections">Active Sections</MenuItem>
               <MenuItem value="Removed Sections">Removed Sections</MenuItem>
            </Select>
         </FormControl>
         
         <FormControl sx={{ minWidth: 120, width: "100%", maxWidth: "12rem" }}>
            <InputLabel>Records/Page</InputLabel>
            <Select
               value={recordsPerPage}
               onChange={handleRecordsPerPageChange}
               label="Records/Page"
            >
               {[5, 10, 20, 30].map((num) => (
                  <MenuItem key={num} value={num}>
                  {num}
                  </MenuItem>
               ))}
            </Select>
         </FormControl>
         
         {/* Refresh Button */}
         <Button
            variant="contained"
            color="primary"
            onClick={handleRefresh}
            sx={{ height: "100%" }}
            >
            <motion.div animate={controls}>
               <RefreshIcon />
            </motion.div>
         </Button>
      </motion.div>
   );
};

export default FilterSectionsBar;