import React, { useState } from "react";


function SpecificCourseInformation({ courseID, sections, learningObjectives }) {
   const [selectedTab, setSelectedTab] = useState("Sections"); // State variable used to handle the tabs of the interface

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
                  selectedTab === "CLO Mappings" ? "bg-blue-500 text-white" : "bg-gray-200"
               }`}
               onClick={() => setSelectedTab("CLO Mappings")}
            >
               CLO Mappings
            </button>
         </div>

         {/* Display Section */}
         <div className="p-4 border rounded-md bg-gray-100 min-h-[200px]">
            {selectedTab === "Sections" ? (
               <div>
                  <h3 className="font-bold text-lg mb-4">Sections</h3>
                  {sections.length > 0 ? (
                     <div className="flex flex-col gap-4">
                        {sections.map((section, index) => (
                           <div key={index} className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row items-center justify-between border">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                 <p className="font-semibold text-gray-700">
                                    <span className="text-gray-500">Course:</span> {section.course.name}
                                 </p>
                                 <p className="font-semibold text-gray-700">
                                    <span className="text-gray-500">Semester:</span> {section.semester.designation}
                                 </p>
                                 <p className="font-semibold text-gray-700">
                                    <span className="text-gray-500">CRN:</span> {section.crn}
                                 </p>
                                 <p className="font-semibold text-gray-700">
                                    <span className="text-gray-500">Instructor:</span> {section.instructor.last_name}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p>No sections available.</p>
                  )}
               </div>
            ) : (
               <div>
                  <h3 className="font-bold text-lg">CLO Mappings</h3>
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
