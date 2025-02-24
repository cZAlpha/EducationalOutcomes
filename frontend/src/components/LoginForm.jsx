import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import '../index.css'; // Tailwind import

function Form() {
   // START - User Role Ascertation Code
   const roles = [
      { id: 1, name: 'user' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'root' },
   ];
   
   const findRoleName = (rolePk) => {
      const role = roles.find(r => r.id === rolePk);
      return role ? role.name : 'Unassigned';  // ✔️ Changed to role.name
   };   
   // STOP - User Role Ascertation Code
   
   const [d_number, setD_number] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   
   const handleSubmit = async (e) => {
      setLoading(true);
      e.preventDefault();
      
      try {
         const payload = { d_number, password };
         const res = await api.post("/api/token/", payload);  // Adjusted endpoint
         
         // Store tokens in localStorage
         localStorage.setItem(ACCESS_TOKEN, res.data.access);
         localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
         
         // Fetch user details using d_number
         const userRes = await api.get(`/api/users/${d_number}`);
         
         // Store user data in localStorage
         if (userRes.data && typeof userRes.data === 'object') {
            localStorage.setItem(USER, JSON.stringify(userRes.data));
         } else {
            localStorage.setItem(USER, userRes.data);
         }
         
         // Retrieve and parse user data from localStorage
         const storedUser = localStorage.getItem(USER);
         console.log("Stored User:", storedUser);
         
         if (storedUser) {
            try {
               const user = JSON.parse(storedUser);
               console.log("Parsed User:", user);
               
               const userRole = findRoleName(user?.role?.id);  // Pass the role ID
               if (userRole === 'root' || userRole === 'admin') {
                  navigate("/dashboard");
               } else if (userRole === 'user') {
                  navigate("/userdashboard");
               } else {
                  console.log("Unknown role:", userRole);
               }
            } catch (error) {
               console.error("Error parsing user JSON:", error);
            }
         } else {
            console.error("No user data found in localStorage.");
         }
      } catch (error) {
         if (error.response && (error.response.status === 400 || error.response.status === 401)) {
            alert("Invalid credentials.");
         } else {
            console.log(error);
            alert("An error occurred. Please try again.");
         }
      } finally {
         setLoading(false);
      }
   };
   

   return (
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto">
         <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">Login</h1>

            <TextField 
               className="form-input w-full"
               label="D#" 
               variant="outlined" 
               value={d_number} 
               onChange={(e) => setD_number(e.target.value)} 
               fullWidth
            />

            <TextField 
               className="form-input w-full"
               label="Password" 
               variant="outlined" 
               type="password"
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               fullWidth
            />

            <div className="flex flex-col items-center">
               {loading && <LoadingIndicator />}
            </div>

            <div className="flex flex-col items-center space-y-4">
               {!loading && (
                  <Button
                     type="submit"
                     sx={{
                        color: 'rgb(250 250 250)',
                        backgroundColor: 'rgb(28, 76, 113)',
                        '&:hover': {
                           backgroundColor: 'rgb(65, 156, 214)',
                        },
                     }}
                  >
                     Login
                  </Button>
               )}
            </div>
         </div>
      </form>
   );
}

export default Form;
