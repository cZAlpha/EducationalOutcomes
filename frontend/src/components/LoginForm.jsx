import { useState } from "react";
import { useAuth } from "./AuthProvider";
import LoadingIndicator from "./LoadingIndicator";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "../index.css"; // Tailwind import


function Form() {
   const [d_number, setD_number] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const { login } = useAuth();
   
   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
         await login(d_number, password);
      } catch {
         alert("Invalid credentials.");
      } finally {
         setLoading(false);
      }
   };
   
   return (
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
            
            <div className="flex flex-col items-center">{loading && <LoadingIndicator />}</div>
            
            <div className="flex flex-col items-center space-y-4">
               {!loading && (
                  <Button
                     type="submit"
                     sx={{
                        color: "rgb(250 250 250)",
                        backgroundColor: "rgb(28, 76, 113)",
                        "&:hover": {
                           backgroundColor: "rgb(65, 156, 214)",
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
