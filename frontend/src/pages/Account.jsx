import React from "react";
import { useAuth } from "../components/AuthProvider"; // Import useAuth to access user state
import { Container, Paper, Typography, Box, Stack } from "@mui/material";
import { AccountCircle, Email, Badge, CalendarToday, Work } from "@mui/icons-material";
import { motion } from "framer-motion";


function Account() {
   const { user } = useAuth(); // Get user from AuthContext
   
   return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
         <Typography variant="h4" color="white" fontWeight="bold" textAlign="center" mb={4}>
            Account Details
         </Typography>
         
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
         >
            {user ? (
               <Paper elevation={6} sx={{p: 4, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.7)'}}>
                  <Stack spacing={2}>
                     <InfoRow icon={<AccountCircle />} label="First Name" value={user.first_name} />
                     <InfoRow icon={<AccountCircle />} label="Last Name" value={user.last_name} />
                     <InfoRow icon={<Email />} label="Email" value={user.email} />
                     <InfoRow icon={<Badge />} label="D-Number" value={user.d_number} />
                     {user.employee_id && <InfoRow icon={<Work />} label="Employee ID" value={user.employee_id} />}
                     <InfoRow icon={<Work />} label="Role" value={user.role?.role_name} />
                     <InfoRow icon={<CalendarToday />} label="Date Created" value={new Date(user.date_created).toLocaleString()} />
                  </Stack>
               </Paper>
            ) : (
               <Typography variant="h6" color="text.secondary" textAlign="center">
                  No user information available.
               </Typography>
            )}
         </motion.div>
      </Container>
   );
}

// Reusable MUI component for each info row
const InfoRow = ({ icon, label, value }) => (
   <Box display="flex" alignItems="center" gap={2} p={2} sx={{ bgcolor: "grey.100", borderRadius: 2 }}>
      {icon}
      <Box>
         <Typography variant="body2" color="text.secondary">
            {label}
         </Typography>
         <Typography variant="body1" fontWeight="medium">
            {value || "N/A"}
         </Typography>
      </Box>
   </Box>
);

export default Account;
