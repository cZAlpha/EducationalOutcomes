import React from "react";
import { Card, CardContent, Typography, Box, Divider } from "@mui/material";
import { motion } from "framer-motion";

const EmbeddedTaskCard = ({
   questionNumber, // The ordinal number of the task
   questionText, // The description of the task
   questionScore, // The avg score of the task
}) => {
   
   const getBackgroundColor = (score) => {
      if (score < 70) return 'bg-red-500';
      if (score < 80) return 'bg-orange-500';
      if (score < 84) return 'bg-yellow-300';
      if (score < 90) return 'bg-green-200';
      if (score < 95) return 'bg-green-400';
      return 'bg-green-600';
   };
   
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="w-full"
      >
         <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 3, p: 2 }}>
            <CardContent>
               {/* Header (flex row) */}
               <div className={"flex flex-row justify-between w-full"}>
                  {/* Question Number */}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                     {questionNumber ?? "?"}
                  </Typography>
                  {/* Question Score */}
                  <div className={`${questionScore ? getBackgroundColor(questionScore) : 'bg-white'} rounded-lg px-2`}>
                     <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {questionScore + "%" ?? ""}
                     </Typography>
                  </div>
               </div>
               
               <Divider sx={{ my: 1 }} />
               
               {/* Question Text */}
               <Typography variant="subtitle2" color="text.secondary" textAlign="left">
                  {questionText || ""}
               </Typography>       
            </CardContent>
         </Card>
      </motion.div>
   );
};

export default EmbeddedTaskCard;
