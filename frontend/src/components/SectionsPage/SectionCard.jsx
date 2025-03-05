import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
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
               {/* Top Section: Course Name & Section Number */}
               <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                     {course_details?.name || "Unknown Course"}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                     #{section_number}
                  </Typography>
               </Box>
               {/* Bottom Section: Attributes of the Section */}
               <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-start" // Justify content to the start
                  alignItems="flex-start" // Align items to the start (left)
                  width="100%" // Ensure the box takes full width
               >
                  <Typography variant="body1" color="text.secondary">
                     Semester: {semester_details?.designation}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                  CRN #: {crn}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                     Instructor: {instructor_details?.last_name}
                  </Typography>
               </Box>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default SectionsCard;
