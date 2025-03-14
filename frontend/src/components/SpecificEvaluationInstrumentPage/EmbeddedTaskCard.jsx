import React from "react";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { motion } from "framer-motion";

const EmbeddedTaskCard = ({
   questionNumber, // The ordinal number of the task
   questionText, // The description of the task
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
               {/* Qeustion Number */}
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Task #{questionNumber ?? "?"}
               </Typography>
               
               <Divider sx={{ my: 1 }} />
               
               {/* Question Text */}
               <Typography variant="subtitle2" color="text.secondary">
                  {questionText || ""}
               </Typography>       
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default EmbeddedTaskCard;
