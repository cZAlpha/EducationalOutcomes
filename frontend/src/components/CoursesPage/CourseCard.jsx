import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const CourseCard = ({
   // ENSURE THESE MATCH THE ACTUAL ATTRIBUTE NAMES FROM THE DATABASE OR IT WON'T WORK
   name,
   program_name,
   course_number,
   a_version_details,
   date_added,
   date_removed,
}) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="w-full"
      >
         <Card 
            sx={{ 
               width: "100%", 
               boxShadow: 3, 
               borderRadius: 3, 
               p: 2, 
               ...(date_removed && { backgroundColor: "#f0f0f0", opacity: 0.6 }) // Grey out card if date_removed exists
            }}
         >
            <CardContent sx={{ width: "100%", p: 0 }}>
               <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {name || ""}
               </Typography>
               <Typography variant="h6">
                  {program_name} {course_number}
               </Typography>
               <Typography variant="body1" color="text.secondary">
                  Accreditation: {a_version_details?.a_organization.name || ""} ({a_version_details?.year || ""})
               </Typography>
               <Typography variant="body1" color="text.secondary">
                  Date Added: {date_added} {date_removed && ` | Date Removed: ${date_removed}`}
               </Typography>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default CourseCard;
