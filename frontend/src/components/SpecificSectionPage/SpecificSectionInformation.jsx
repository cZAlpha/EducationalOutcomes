import React, { useEffect, useState } from "react";
import api from '../../api';
import LoadingIndicator from '../LoadingIndicator';
import EvaluationInstrumentCard from "./EvaluationInstrumentCard";


function SpecificSectionInformation (section) {
   const [loading, setLoading] = useState(true); // State to track loading status
   const [selectedTab, setSelectedTab] = useState("Evaluation Instruments");
   const [evaluationInstruments, setEvaluationInstruments] = useState([]);
   
   // START - Eval. Instrument data fetching
   const getEvaluationInstruments = async () => {
      try {
         const res = await api.get("/api/evaluation-instruments/");
         const filteredEvals = res.data.filter(e => e.section === section.section.section_id); // Whitelist filter
         setEvaluationInstruments(filteredEvals);
      } catch (err) {
         alert(`Error fetching Evaluation Instruments: ${err.message}`);
      }
   };
   // STOP - Eval. Instrument data fetching
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getEvaluationInstruments();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
      console.log("Evals: ", evaluationInstruments);
   }, []);
   
   
   // HTML STUFF
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
                  <h3 className="font-bold text-lg mb-4">Evaluation Instruments</h3>
                  {loading ? (
                     <LoadingIndicator />
                  ) : evaluationInstruments.length === 0 ? (
                     <p className="text-center text-gray-500">No evaluation instruments for this section</p>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evaluationInstruments.map((instrument) => (
                           <div key={instrument.evaluation_instrument_id}>
                              <EvaluationInstrumentCard 
                                 name={instrument.name} 
                                 evaluation_type={instrument.evaluation_type_details?.type_name} 
                                 description={instrument.description} 
                              />
                           </div>
                        ))}
                     </div>
                  )}
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
