import React from "react";
import Navbar from "../components/Navbar";


function Home() {
   return (
      <> {/* Singular parent element required by React */}
         <Navbar />
         <div className="flex flex-col items-center justify-center w-full text-center space-y-12">
         <h1 className="pt-12 pb-8 text-3xl font-bold min-h-[60vh]">Hero Section Placeholder :)</h1>
         <h1 id="about" className="pb-8 text-3xl font-bold min-h-[60vh]">About Us Section Placeholder</h1>
         <h1 id="contact" className="pb-8 text-3xl font-bold min-h-[60vh]">Contact Us Section Placeholder</h1>
         </div>
      </>
   );
}

export default Home;