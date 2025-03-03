import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const SpecificCoursesSectionCard = ({
   course,
   section_number,
   semester,
   crn,
   instructor,
}) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="w-full"
      >
         <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 3, p: 2 }}>
            <CardContent>
               {/* Top Section: Course Name & Section Number */}
               <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                     {course || "Unknown Course"}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                     #{section_number}
                  </Typography>
               </Box>

               {/* Divider for spacing */}
               <Box sx={{ my: 1, borderBottom: "1px solid #ddd" }} />

               {/* Bottom Section: Details */}
               <Box display="flex" flexWrap="wrap" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                     <strong>Semester:</strong> {semester}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     <strong>CRN #:</strong> {crn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     <strong>Instructor:</strong> {instructor}
                  </Typography>
               </Box>
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default SpecificCoursesSectionCard;
