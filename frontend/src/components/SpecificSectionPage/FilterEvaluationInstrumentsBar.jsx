import React from "react";
import { motion } from "framer-motion";
import { TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

function FilterEvaluationInstrumentsBar ({ 
      filterName, 
      setFilterName, 
      availableEvalTypes,
      filterType, 
      setFilterType, 
      perPage, 
      setPerPage, 
   }) {
   
   
   return (
      <motion.div
         className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white shadow-md rounded-lg"
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3 }}
      >
         {/* Filter by Name */}
         <TextField
            label="Filter by Name"
            variant="outlined"
            size="small"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full md:w-1/3"
         />
         
         {/* Filter by Type */}
         <FormControl size="small" className="w-full md:w-1/3">
            <InputLabel>Filter by Type</InputLabel>
            <Select 
               value={filterType} 
               onChange={(e) => setFilterType(e.target.value)} 
               label="Filter by Type"
            >
               <MenuItem value="">All</MenuItem>
               {Array.isArray(availableEvalTypes) && availableEvalTypes.length > 0 ? (
                  availableEvalTypes.map((type) => (
                     <MenuItem key={type.evaluation_type_id} value={type.evaluation_type_id}>
                        {type.type_name}
                     </MenuItem>
                  ))
               ) : (
                  <MenuItem disabled>No types available</MenuItem>
               )}
            </Select>
         </FormControl>
         
         
         {/* Items Per Page */}
         <FormControl size="small" disabled className="w-full md:w-1/4">
            <InputLabel>Items per Page</InputLabel>
            <Select value={perPage} onChange={(e) => setPerPage(e.target.value)} label="Items per Page">
               <MenuItem value={5}>5</MenuItem>
               <MenuItem value={10}>10</MenuItem>
               <MenuItem value={20}>20</MenuItem>
            </Select>
         </FormControl>
      </motion.div>
   );
}

export default FilterEvaluationInstrumentsBar;
