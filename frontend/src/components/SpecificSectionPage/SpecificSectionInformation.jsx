import React, { useState } from "react";
import { Button } from "@mui/material";


function SpecificSectionInformation() {
   const [selectedTab, setSelectedTab] = useState("Evaluation Instruments");
   
   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="w-full flex justify-between mb-4 gap-x-4">
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "Evaluation Instruments" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("Evaluation Instruments")}
            >
               Evaluation Instruments
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "Performance" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("Performance")}
            >
               Performance
            </button>
         </div>
         
         {/* Display Section */}
         <div className="w-full p-4 border rounded-md bg-gray-100 min-h-[200px]">
            {selectedTab === "Evaluation Instruments" ? (
               <div>
                  <h3 className="font-bold text-lg">Evaluation Instruments</h3>
                  {/* Content specific to Evaluation Instruments */}
                  <p>This is the content for Evaluation Instruments tab.</p>
               </div>
            ) : (
               <div>
                  <h3 className="font-bold text-lg">Performance</h3>
                  {/* Content specific to Performance */}
                  <p>This is the content for Performance tab.</p>
               </div>
            )}
         </div>
      </div>
   );
}

export default SpecificSectionInformation;
