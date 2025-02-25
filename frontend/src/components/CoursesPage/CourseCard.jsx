import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";

const CourseCard = ({
   courseName,
   programName,
   courseNumber,
   accreditationOrganization,
   accreditationVersion,
   dateAdded,
   dateRemoved,
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
                  {courseName}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Program: {programName}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Course Number: {courseNumber}
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Accreditation: {accreditationOrganization} (v{accreditationVersion})
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Date Added: {dateAdded}
               </Typography>
               {dateRemoved && (
                  <Typography variant="body2" color="error">
                  Date Removed: {dateRemoved}
                  </Typography>
               )}
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default CourseCard;
