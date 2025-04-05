import LoginForm from "../components/LoginForm"


function Login() {
   return (
      <> {/* Singular parent element required by React*/}
         <div className="p-10">
            <LoginForm route="/api/token/" method="login" />
         </div>
      </>
   );
}

export default Login