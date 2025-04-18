import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import LoadingIndicator from "./LoadingIndicator";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Form() {
   const [d_number, setD_number] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const { login } = useAuth();
   const navigate = useNavigate();
   
   
   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
         await login(d_number, password);
         navigate("/");
      } catch (error) {
         console.error("Login failed: ", error);
         alert("Invalid credentials.");
         setLoading(false);
      }
   };
   
   
   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.5 }}
      >
         <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto"
         >
            <div className="space-y-6">
               <h1 className="text-2xl font-bold text-gray-800 text-center">Login</h1>
               
               <TextField
                  className="form-input w-full"
                  label="D#"
                  variant="outlined"
                  value={d_number}
                  onChange={(e) => {
                     let value = e.target.value;
                     
                     // Convert to uppercase and remove any non-digit characters
                     value = value.toUpperCase().replace(/[^D\d]/g, '');
                     
                     // Ensure it starts with D
                     if (value.length > 0 && value[0] !== 'D') {
                        value = 'D' + value.replace(/\D/g, '');
                     }
                     
                     // Enforce exactly 9 characters (D + 8 digits)
                     value = value.slice(0, 9);
                     
                     // Only update if it matches our pattern (D followed by digits)
                     if (/^D\d{0,8}$/.test(value)) {
                        setD_number(value);
                     }
                  }}
                  fullWidth
                  slotProps={{
                     input: {
                        maxLength: 9,
                        pattern: '^D\\d{8}$',  // Strict 9-character pattern
                     },
                  }}
                  helperText={
                     d_number.length !== 9 
                        ? "Must be exactly 9 characters (D followed by 8 digits)"
                        : "Format: D12345678"
                  }
                  error={d_number.length > 0 && d_number.length !== 9}
                  required
               />
               
               <TextField
                  className="form-input w-full"
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
               />
               
               {loading &&
                  <div className="flex flex-col items-center">
                     <LoadingIndicator />
                  </div>
               }
               
               {!loading && (
                  <div className="flex flex-col items-center space-y-4">
                     <Button
                        type="submit"
                        sx={{
                           color: "rgb(250 250 250)",
                           backgroundColor: "rgb(28, 76, 113)",
                           "&:hover": {
                              backgroundColor: "rgb(65, 156, 214)",
                           },
                           "&:disabled": {
                              backgroundColor: "rgba(28, 76, 113, 0.67)",
                           }
                        }}
                        disabled={ !(d_number.length === 9 && password.length > 0) }
                     >
                        Login
                     </Button>
                  </div>
               )}
            </div>
         </form>
      </motion.div>
   );
}

export default Form;