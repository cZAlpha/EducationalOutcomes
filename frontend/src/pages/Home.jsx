import React from "react";
import Navbar from "../components/Navbar";

function Home() {
   return (
      <> {/* Singular parent element required by React */}
         <div className="w-full flex justify-center pt-10">
            <h1 className="text-white text-4xl font-bold">Educational Outcomes</h1>
         </div>
         
         <div className="flex justify-center items-center pt-4 pb-10">
            <div className="flex flex-row w-[60%] rounded-2xl shadow-lg overflow-hidden">
               <img
                  src="https://collegesofdistinction.com/wp-content/uploads/2021/08/delaware-state-university-1.jpeg"
                  alt="DSU Campus Image"
                  className="w-4/6 object-cover"
               />
               <div className="w-2/6 bg-gray-100 backdrop-blur-md bg-opacity-[80%] flex flex-col justify-center items-start p-4 space-y-4">
                  <a href="#" className="text-blue-600 hover:underline">DSU Blackboard</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Two</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Three</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Four</a>
                  <a href="#" className="text-blue-600 hover:underline">Link Five</a>
               </div>
            </div>
         </div>
         
         <div className="w-full flex justify-center mb-20"> 
            <div className="flex flex-col justify-center items-center backdrop-blur-md bg-opacity-[80%] w-[60%] bg-gray-100 rounded-2xl shadow-lg p-8 space-y-6">
               <h1 className="text-3xl font-semibold text-center">Announcements</h1>
               
               <div className="flex flex-col space-y-6">
                  <div className="w-[600px] bg-white rounded-2xl shadow-md p-6 space-y-3">
                     <h2 className="text-xl font-semibold">Announcement Title 1</h2>
                     <h4 className="text-sm text-gray-600">Author Name</h4>
                     <p className="text-base text-gray-700 leading-relaxed">
                        This is the content for the first announcement. It can include details, updates, or any relevant information.
                     </p>
                  </div>
                  
                  <div className="w-[600px] bg-white rounded-2xl shadow-md p-6 space-y-3">
                     <h2 className="text-xl font-semibold">Announcement Title 2</h2>
                     <h4 className="text-sm text-gray-600">Author Name</h4>
                     <p className="text-base text-gray-700 leading-relaxed">
                        Here is some content for the second announcement. Each card takes the full width of the section with appropriate spacing.
                     </p>
                  </div>
                  
                  <div className="w-[600px] bg-white rounded-2xl shadow-md p-6 space-y-3">
                     <h2 className="text-xl font-semibold">Announcement Title 3</h2>
                     <h4 className="text-sm text-gray-600">Author Name</h4>
                     <p className="text-base text-gray-700 leading-relaxed">
                        The third announcement content goes here. The layout keeps all cards aligned and spaced evenly.
                     </p>
                  </div>
               </div>
            </div>
         </div>



      </>
   );
}

export default Home;
