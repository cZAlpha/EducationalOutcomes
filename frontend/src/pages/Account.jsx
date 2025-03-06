import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { USER } from "../constants";
import { Container, Paper, Typography, Box, Stack } from "@mui/material";
import { AccountCircle, Email, Badge, CalendarToday, Work } from "@mui/icons-material";

function Account() {
   const [currentUser, setCurrentUser] = useState(null);

   useEffect(() => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         setCurrentUser(userData || null);
      } catch (error) {
         console.error("Account Component | Error loading user from localStorage:", error);
         setCurrentUser(null);
      }
   }, []);

   return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
         <Typography variant="h4" color="white" fontWeight="bold" textAlign="center" mb={4}>
            Account Details
         </Typography>

         {currentUser ? (
            <Paper elevation={6} sx={{p: 4, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.7)'}}>
               <Stack spacing={2}>
                  <InfoRow icon={<AccountCircle />} label="First Name" value={currentUser.first_name} />
                  <InfoRow icon={<AccountCircle />} label="Last Name" value={currentUser.last_name} />
                  <InfoRow icon={<Email />} label="Email" value={currentUser.email} />
                  <InfoRow icon={<Badge />} label="D-Number" value={currentUser.d_number} />
                  {currentUser.employee_id && <InfoRow icon={<Work />} label="Employee ID" value={currentUser.employee_id} />}
                  <InfoRow icon={<Work />} label="Role" value={currentUser.role?.role_name} />
                  <InfoRow icon={<CalendarToday />} label="Date Created" value={new Date(currentUser.date_created).toLocaleString()} />
               </Stack>
            </Paper>
         ) : (
            <Typography variant="h6" color="text.secondary" textAlign="center">
               No user information available.
            </Typography>
         )}
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
