import Form from "../components/Form"
import Navbar from "../components/Navbar";


function Register() {
   return (
      <> {/* Singular parent element required by React*/}
         <Navbar/>
         <div className="p-10">
            <Form route="/api/user/register/" method="register" />
         </div>
      </>
   );
}

export default Register