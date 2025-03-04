import React, { useEffect, useState } from "react";
// MISSING IMPORT FOR: FilterSectionsBar
// MISSING IMPORT FOR: SectionsTable
import api from '../api';
import { USER } from "../constants";


const Sections = () => {
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div /* HeaderContent */ className="flex justify-left items-center w-[70%] pt-8">
            <h1 /*Title */ className="text-3xl font-bold">Sections</h1>
         </div>
         
         <div className="w-[70%]">
            Filter Sections Bar
         </div>
         
         <div>
            Sections Table
         </div>
      </div>
   );
};

export default Sections;
