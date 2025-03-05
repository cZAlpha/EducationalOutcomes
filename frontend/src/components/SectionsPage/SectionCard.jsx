import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const SectionsCard = ({
   // ENSURE THESE MATCH THE ACTUAL ATTRIBUTE NAMES FROM THE DATABASE OR IT WON'T WORK
   course_details,
   section_number,
   semester_details,
   crn,
   instructor_details,
   }) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="w-full"
      >
         <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 3, p: 2 }}>
            <CardContent sx={{ width: "100%", p: 0 }}>
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {course_details?.name + " - " + section_number || ""}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Section number: {section_number}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Semester: {semester_details?.designation}
               </Typography>
               <Typography variant="body2" color="text.secondary">
               CRN #: {crn}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Instructor: {instructor_details?.last_name}
               </Typography>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default SectionsCard;
