import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';


function NotFound() {
   const location = useLocation(); // Gets the current route to be displayed to the user
   const navigate = useNavigate(); // Hook to navigate programmatically
   
   const handleGoToLogin = () => {
      navigate("/login"); // Navigate to login page
   };
   
   return (
      <div
         style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100vh',
            textAlign: 'center',
         }}
      >
         <h1 style={{ paddingBottom: '30px' }}>404 Not Found</h1>
         <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            The page you're looking for doesn't exist!
         </p>
         <p style={{ fontSize: '16px', marginTop: '10px', color: 'gray' }}>
            <code>{location.pathname}</code> does not exist.
         </p>
         
         <Button onClick={handleGoToLogin} variant="contained" style={{ marginTop: '20px' }}>
            Go to Login
         </Button>
      </div>
   );
}

export default NotFound;
