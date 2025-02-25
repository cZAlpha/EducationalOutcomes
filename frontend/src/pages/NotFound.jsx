import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";


function NotFound() {
   const location = useLocation(); // Gets the current route to be displayed to the user
   
   
   // HTML
   return (
      <> {/* Singular parent element required by React*/}
         <Navbar/>
         <div className="w-full flex justify-center mt-32"> 
            <div className="flex flex-col items-center justify-center p-4 text-center backdrop-blur-md bg-opacity-[80%] bg-gray-100 rounded-2xl shadow-lg w-[800px]">
               <h1 style={{ paddingBottom: '30px' }}>404 Not Found</h1>
               <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  The page you're looking for doesn't exist!
               </p>
               <p style={{ fontSize: '16px', marginTop: '10px', marginBottom: '20px', color: 'gray' }}>
                  <code>{location.pathname}</code> does not exist or could not be found.
               </p>
               
               <Link to="/"> {/* Go home when clicked */}
                  <Button 
                     variant="contained" 
                     sx={{
                        backgroundColor: '#3968b3',
                     }}
                  >
                     Go Home
                  </Button>
               </Link>
            </div>
         </div>
      </>
   );
}

export default NotFound;
