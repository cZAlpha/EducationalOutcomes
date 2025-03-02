import React, { useState } from "react";

function SpecificCourseInformation({ courseID, sections = [], learningObjectives = [] }) {
   const [selectedTab, setSelectedTab] = useState("Sections");

   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="flex justify-between mb-4 gap-x-4">
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "Sections" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("Sections")}
            >
               Sections
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full ${
                  selectedTab === "Learning Objectives" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("Learning Objectives")}
            >
               Learning Objective Mappings
            </button>
         </div>

         {/* Display Section */}
         <div className="p-4 border rounded-md bg-gray-100 min-h-[200px]">
            {selectedTab === "Sections" ? (
               <div>
                  <h3 className="font-bold text-lg">Sections</h3>
                  {sections.length > 0 ? (
                     <ul className="list-disc list-inside">
                        {sections.map((section, index) => (
                           <li key={index}>{section}</li>
                        ))}
                     </ul>
                  ) : (
                     <p>No sections available.</p>
                  )}
               </div>
            ) : (
               <div>
                  <h3 className="font-bold text-lg">Learning Objective Mappings</h3>
                  {learningObjectives.length > 0 ? (
                     <ul className="list-disc list-inside">
                        {learningObjectives.map((obj, index) => (
                           <li key={index}>{obj}</li>
                        ))}
                     </ul>
                  ) : (
                     <p>No learning objectives available.</p>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}

export default SpecificCourseInformation;
