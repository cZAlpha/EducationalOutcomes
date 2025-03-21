import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { motion, AnimatePresence } from "framer-motion";

const AddCourseButton = () => {
   const [expanded, setExpanded] = useState(false); // State variable used to keep track of if the button has been expanded or nah
   const navigate = useNavigate();
   
   const handleMainClick = () => { // Swaps state variable for expansion
      setExpanded((prev) => !prev);
   };
   
   const handleOptionClick = (path) => { // Handles routing after an option is picked
      setExpanded(false);
      navigate(path);
   };
   
   return (
      <div className="relative inline-flex items-center">
         <Button
         onClick={handleMainClick}
         variant="contained"
         color="primary"
         
         sx={{ width: "auto", px: 1.5, py: 1, borderRadius: 3, boxShadow: 3 }}
         >
         {expanded ? <RemoveIcon /> : <AddIcon />}
         </Button>
         
         <AnimatePresence>
         {expanded && (
            <motion.div
               initial={{ opacity: 0, width: 0 }}
               animate={{ opacity: 1, width: "15rem" }}
               exit={{ opacity: 0, width: 0 }}
               transition={{ duration: 0.3 }}
               className="absolute right-full mr-2 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-row"
            >
               <Button
               onClick={() => handleOptionClick("/add-course/manual")}
               fullWidth
               sx={{ py: 0.5, justifyContent: "flex-start", fontWeight: "bold" }}
               >
               From Scratch
               </Button>
               <Button
               onClick={() => handleOptionClick("/add-course/template")}
               fullWidth
               disabled
               sx={{ py: 0.5, justifyContent: "flex-start", fontWeight: "bold" }}
               >
               From Template
               </Button>
            </motion.div>
         )}
         </AnimatePresence>
      </div>
   );
};

export default AddCourseButton;
