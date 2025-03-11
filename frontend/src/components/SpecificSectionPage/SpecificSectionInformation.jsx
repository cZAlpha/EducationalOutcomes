import React, { useEffect, useState } from "react";
import api from '../../api';
import LoadingIndicator from '../LoadingIndicator';
import EvaluationInstrumentCard from "./EvaluationInstrumentCard";
import AddEvaluationInstrumentButton from "./AddNewEvaluationInstrumentButton";
import FilterEvaluationInstrumentsBar from "./FilterEvaluationInstrumentsBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


function SpecificSectionInformation (section) {
   const navigate = useNavigate(); // For navigating to specific section page
   const [loading, setLoading] = useState(true); // State to track loading status
   const [selectedTab, setSelectedTab] = useState("Evaluation Instruments");
   const [evaluationInstruments, setEvaluationInstruments] = useState([]);
   const [evaluationTypes, setEvaluationTypes] = useState([]); 
   const [CLOs, setCLOs] = useState([]);
   const [sectionPerformance, setSectionPerformance] = useState({}); // Obj to store the performance of a section

   // Filtering Variables
   const [filteredInstruments, setFilteredInstruments] = useState([]);
   const [filterName, setFilterName] = useState("");
   const [filterType, setFilterType] = useState("");
   const [perPage, setPerPage] = useState(10);
   
   
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
   // STOP  - Eval. Instrument data fetching
   
   // START - Eval. Instrument data fetching
   const getEvaluationTypes = async () => {
      try {
         const res = await api.get("/api/evaluation-types/");
         setEvaluationTypes(res.data);
      } catch (err) {
         alert(`Error fetching Evaluation Instrument Types: ${err.message}`);
      }
   };
   // STOP  - Eval. Instrument data fetching
   
   // START - CLO fetching and filtering
   const getCLOs = async () => {
      const filterCLOs = (unfilteredCLOs) => {
         return unfilteredCLOs.filter(clo => clo.course === section.section.course);
      };   
      try {
         const res = await api.get('/api/course-learning-objectives/');
         setCLOs(filterCLOs(res.data)); // Filter and then set the CLOs
         console.log("CLOs: ", filterCLOs(res.data));
      } catch (err) {
         alert(`Error fetching CLOs: ${err.message}`);
      }
   };
   // STOP  - CLO fetching and filtering
   
   // START - Section Performance data fetching
   const getSectionPerformance = async () => {
      try {
         const res = await api.get(`/api/sections/${section.section.section_id}/performance/`);
         if (!res.data || !res.data.performance) {
            setSectionPerformance({});
            return;
         }
         
         // Map CLO IDs to their corresponding 'designation' attribute
         const mappedPerformance = Object.entries(res.data.performance).map(([cloId, score]) => {
            const cloObj = CLOs.find(clo => clo.clo_id === parseInt(cloId)); // Match CLO object by ID
            return {
               designation: cloObj ? cloObj.designation : `Unknown CLO (${cloId})`,
               description: cloObj ? cloObj.description : "",
               score: score.toFixed(2),
            };
         });
         setSectionPerformance(mappedPerformance);
      } catch (err) {
         alert(`Error fetching Performance Data: ${err.message}`);
      }
   };   
   // STOP  - Section Performance data fetching
   
   const handleEvaluationInstrumentClick = (evaluationInstrumentId) => { // Navigates to the given specific evaluation instrument page
      navigate(`/evaluation-instruments/${evaluationInstrumentId}`);
   };
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getEvaluationInstruments();
         await getEvaluationTypes();
         await getCLOs();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
   }, []);
   
   useEffect(() => { // Performance Report Call
      if (CLOs.length > 0) {
         getSectionPerformance();
      }
   }, [CLOs]); // This ensures `getSectionPerformance()` runs only after `CLOs` is updated
   
   useEffect(() => {
      setFilteredInstruments(
         evaluationInstruments
            .filter(e => e.name.toLowerCase().includes(filterName.toLowerCase()))
            .filter(e => (filterType ? e.evaluation_type_details?.evaluation_type_id === filterType : true))
            .slice(0, perPage)
      );
   }, [filterName, filterType, perPage, evaluationInstruments]); // Depend on filters
   
   // HTML STUFF
   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Selectors */}
         <div className="w-full flex justify-between mb-4 gap-x-4">
            <button
               className={`px-4 py-2 rounded-md w-full font-bold
                  ${selectedTab === "Evaluation Instruments" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("Evaluation Instruments")}
            >
               Evaluation Instruments
            </button>
            <button
               className={`px-4 py-2 rounded-md w-full font-bold
                  ${selectedTab === "Performance" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("Performance")}
            >
               Performance
            </button>
         </div>
         
         {/* Display Section */}
         <div className="w-full p-4 border rounded-md bg-gray-100 min-h-[200px]">
            {selectedTab === "Evaluation Instruments" ? (
               <div className="w-full">
                  <div className="w-full flex flex-col gap-y-4 mb-6">
                     <div className="w-full flex flex-row items-center justify-between">
                        <h3 className="font-bold text-lg">Evaluation Instruments</h3>
                        <AddEvaluationInstrumentButton />
                     </div>
                     
                     {/* Filter Evaluation Instruments Bar */}
                     <FilterEvaluationInstrumentsBar
                        filterName={filterName}
                        setFilterName={setFilterName}
                        availableEvalTypes={evaluationTypes || []}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        perPage={perPage}
                        setPerPage={setPerPage}
                        types={[...new Set(evaluationInstruments.map(e => e.evaluation_type_details?.type_name).filter(Boolean))]}
                     />
                  </div>
                  
                  {loading ? (
                     <LoadingIndicator />
                  ) : evaluationInstruments.length === 0 ? (
                     <p className="text-center text-gray-500">No evaluation instruments for this section</p>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredInstruments.map((instrument) => (     
                           <div 
                              key={instrument.evaluation_instrument_id}
                              className="w-full"
                              onClick={(e) => handleEvaluationInstrumentClick(instrument.evaluation_instrument_id)}
                              style={{ cursor: "pointer", pointerEvents: "auto" }}
                           >
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
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
               >
                  <h3 className="font-bold text-lg mb-4">Performance</h3>
                  {/* Content specific to Performance */}
                  {sectionPerformance ? (
                     <div className="w-full p-4 border bg-white rounded-lg shadow">
                        <h4 className="font-bold text-lg mb-4">CLOs</h4>
                        <ul className="space-y-2">
                           {sectionPerformance.map(({ designation, description, score }) => {
                              // Helper function to determine background color
                              const getBackgroundColor = (score) => {
                                 if (score < 70) return 'bg-red-500'; // Red for < 70
                                 if (score < 80) return 'bg-orange-500'; // Orange for 70-79
                                 if (score < 84) return 'bg-yellow-300'; // Yellow for 80-84
                                 if (score < 90) return 'bg-green-200'; // LIGHT Green for 84-89
                                 if (score < 95) return 'bg-green-300'; // Light Green for 90-94
                                 return 'bg-green-600'; // Darker Green for 95+
                              };
                              
                              return (
                                 <li key={designation} className="p-2 rounded">
                                    <div className="flex flex-col gap-y-2 w-full">
                                       <div className={`flex flex-row gap-x-4 w-full p-2 rounded ${getBackgroundColor(score)}`}> {/* Apply background color */}
                                          <span className="font-semibold">CLO {designation}</span>
                                          <span className="">{score ? `${score}%` : "No scores for this CLO"}</span>
                                       </div>
                                       <p className="text-left w-full pl-4">{description}</p>
                                    </div>
                                 </li>
                              );
                           })}
                        </ul>
                     </div>
                  ) : (
                     <p className="text-center text-gray-500">No performance data available.</p>
                  )}
               </motion.div>
            )}
         </div>
      </div>
   );
}

export default SpecificSectionInformation;
