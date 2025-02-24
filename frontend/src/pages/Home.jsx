import React from "react";
import Navbar from "../components/Navbar";

function Home() {
   return (
      <> {/* Singular parent element required by React */}
         <Navbar />
         <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-row w-[60%] rounded-2xl shadow-lg overflow-hidden">
               <img
                  src="https://collegesofdistinction.com/wp-content/uploads/2021/08/delaware-state-university-1.jpeg"
                  alt="DSU Campus Image"
                  className="w-4/5 object-cover"
               />
               <div className="w-1/5 bg-gray-100 flex flex-col justify-center items-start p-4 space-y-4">
                  <a href="#" className="text-blue-600 hover:underline">Link One</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Two</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Three</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Four</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Five</a>
               </div>
            </div>
         </div>
      </>
   );
}

export default Home;
