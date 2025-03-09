import React from "react";
import AddIcon from '@mui/icons-material/Add';


function Tools() {
   return (
      <div className="flex flex-col gap-y-10 items-center h-screen mt-12 justify-start">
         {/* Header */}
         <div className="w-full flex flex-col items-center gap-y-4">
            <h1 className="font-bold text-4xl text-white">Tools</h1>
            <p className="font-semi-bold text-lg text-white">You can generate reports amongst other actions on this page.</p>
         </div>
         {/* Container */}
         <div className="flex flex-col justify-center space-y-6 w-[60vw] bg-[#ffffffb3] rounded-md px-8 py-8 mx-auto">
            {/* Course Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Course Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given course.</p>
               </div>
               <button className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full">
                  <AddIcon />
               </button>
            </div>
            
            {/* Section Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Section Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given section.</p>
               </div>
               <button className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full">
                  <AddIcon />
               </button>
            </div>
            
            {/* Student Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Student Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take into account all CLOs and PLOs a given student has completed evaluation instrument(s) for and given their performance indicators for each one.</p>
               </div>
               <button className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full">
                  <AddIcon />
               </button>
            </div>
            
            {/* Evaluation Instrument Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Evaluation Instrument Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take a given evaluation instrument and give key indicators of student performance on the given CLOs for that evaluation instrument.</p>
               </div>
               <button className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full">
                  <AddIcon />
               </button>
            </div>
         </div>
      </div>   
   );
}

export default Tools;
