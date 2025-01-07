import React from "react";
import Navbar from "../components/Navbar";


function UserDashboard() {
   return (
      <> {/* Singular parent element required by React */}
         <Navbar />
         <div className="flex flex-col items-center justify-center w-full text-center space-y-12">
            <h1 className="pt-12 pb-8 text-3xl font-bold min-h-[60vh]">User Dashboard Placeholder :)</h1>
         </div>
      </>
   );
}

export default UserDashboard;