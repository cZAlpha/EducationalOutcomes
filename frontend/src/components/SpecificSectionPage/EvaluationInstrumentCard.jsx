import React from "react";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { motion } from "framer-motion";

const EvaluationInstrumentCard = ({
   section, // The section the assignment is from
   evaluation_type, // The type of assignment
   name, // The assignment name
   description, // The assignment description
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
               {/* Assignment Name */}
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {name || "Untitled Assignment"}
               </Typography>
               
               {/* Assignment Type */}
               <Typography variant="subtitle2" color="text.secondary">
                  {evaluation_type || "Unknown Type"}
               </Typography>
               
               <Divider sx={{ my: 1 }} />
               
               {/* Description */}
               {description && (
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mt: 1, fontStyle: "italic" }}
                  >
                     {description}
                  </Typography>
               )}            
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default EvaluationInstrumentCard;
