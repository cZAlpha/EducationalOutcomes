import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import '../index.css'; // Tailwind import

function Form({ route, method }) {
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const name = method === "login" ? "Login" : "Register";

   const handleSubmit = async (e) => {
      setLoading(true);
      e.preventDefault();

      try {
         const payload = method === "register" ? { username, email, password } : { username, password };
         const res = await api.post(route, payload);

         if (method === "login") {
            // First, store the access and refresh tokens in localStorage
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

            // Fetch the user ID using the provided username
            const userRes = await api.get(`/api/users/${username}`);

            // Store the user ID in localStorage
            if (userRes.data && typeof userRes.data === 'object') {
               localStorage.setItem(USER, JSON.stringify(userRes.data));  // Stringify the object before storing
            } else {
              localStorage.setItem(USER, userRes.data);  // If it's already a string, store as is
            }
            

            // Printing the object to the console
            const storedUser = localStorage.getItem(USER);
            console.log("Stored User:", storedUser);

            if (storedUser) {
            try {
               const user = JSON.parse(storedUser);
               console.log("Parsed User:", user);
            } catch (error) {
               console.error("Error parsing JSON:", error);
            }
            } else {
            console.log("No data found in localStorage for USER");
            }


            navigate("/dashboard"); // Navigate to the dashboard
         } else {
            navigate("/login"); // If registration was successful, navigate to the login page
         }
      } catch (error) {
         // Handle errors (e.g., username already taken or incorrect credentials)
         if (error.response && (error.response.status === 400 || error.response.status === 401)) {
            alert("Username already taken or invalid credentials.");
         } else {
            console.log(error)
            alert("An error occurred. Please try again.");
         }
      } finally {
         setLoading(false); // Reset the loading state
      }
   };

   const handleSwitchPage = () => {
      if (method === "login") {
         navigate("/register"); // Navigate to the registration page if it's login
      } else {
         navigate("/login"); // Navigate to the login page if it's register
      }
   };

   return (
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto">
         <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">{name}</h1>

            <TextField 
               className="form-input w-full"
               label="Username" 
               variant="outlined" 
               value={username} 
               onChange={(e) => setUsername(e.target.value)} 
               fullWidth
            />

            {method === "register" && (
               <TextField
                  className="form-input w-full"
                  label="Email" 
                  variant="outlined" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  fullWidth
               />
            )}
            
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
               <>
                  <Button
                     type="submit"
                     sx={{
                        color: 'rgb(250 250 250)', // White Text
                        backgroundColor: 'rgb(22 163 74)', // Tailwind's green-600
                        '&:hover': {
                           backgroundColor: 'rgb(34 197 94)', // Tailwind's green-500
                        },
                     }}
                  >
                  {name}
                  </Button>
                  
                  <Button
                     variant="text"
                     sx={{
                        color: 'rgb(22 163 74)', // Tailwind's green-600
                        '&:hover': {
                           color: 'rgb(34 197 94)', // Tailwind's green-500
                        },
                     }}
                     onClick={handleSwitchPage}
                  >
                  {method === 'login' ? 'Register' : 'Or login'}
                  </Button>
               </>
               )}
            </div>
         </div>
      </form>
   );
}

export default Form;
