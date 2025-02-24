import LoginForm from "../components/LoginForm"
import Navbar from "../components/Navbar";


function Login() {
   return (
      <> {/* Singular parent element required by React*/}
         <Navbar/>
         <div className="p-10">
            <LoginForm route="/api/token/" method="login" />
         </div>
      </>
   );
}

export default Login