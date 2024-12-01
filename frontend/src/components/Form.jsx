import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


function Form({ route, method }) {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const name = method === "login" ? "Login" : "Register";

   const handleSubmit = async (e) => {
      setLoading(true);
      e.preventDefault();

      try {
         const res = await api.post(route, { username, password })
         if (method === "login") {
               localStorage.setItem(ACCESS_TOKEN, res.data.access);
               localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
               navigate("/")
         } else {
               navigate("/login")
         }
      } catch (error) {
         alert(error)
      } finally {
         setLoading(false)
      }
   };

   const handleSwitchPage = () => { // Function that handles switching between the login and register pages
      if (method === "login") {
         navigate("/register"); // Navigate to register page if it's login
      } else {
         navigate("/login"); // Navigate to login page if it's register
      }
   };

   return (
      <form onSubmit={handleSubmit} className="form-container">
         <h1>{name}</h1>
         <TextField 
            className="form-input"
            label="Username" 
            variant="outlined" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            fullWidth // Ensures it takes the full width
            sx={{
               width: '90%',
               paddingBottom: '10px',
            }}
         />
         <TextField 
            className="form-input"
            label="Password" 
            variant="outlined" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            fullWidth 
            sx={{
               width: '90%',
               paddingBottom: '30px',
            }}
         />
         {loading && <LoadingIndicator />}
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!loading && (
               <>
                  <Button className="form-button" type="submit" variant="contained">
                     {name}
                  </Button>
                  <Button
                     variant="text"
                     onClick={handleSwitchPage}
                     style={{ 
                        textTransform: 'none', 
                        paddingTop: "20px"
                     }}
                  >
                     {method === "login" ? "Register" : "Or login"}
                  </Button>
               </>
            )}
         </div>
      </form>
   );
}

export default Form