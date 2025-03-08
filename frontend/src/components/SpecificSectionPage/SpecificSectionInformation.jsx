import React, { useEffect, useState } from "react";
import api from '../../api';
import LoadingIndicator from '../LoadingIndicator';
import EvaluationInstrumentCard from "./EvaluationInstrumentCard";
import AddEvaluationInstrumentButton from "./AddNewEvaluationInstrumentButton";
import FilterEvaluationInstrumentsBar from "./FilterEvaluationInstrumentsBar";
import { useNavigate } from "react-router-dom";


function SpecificSectionInformation (section) {
   const navigate = useNavigate(); // For navigating to specific section page
   const [loading, setLoading] = useState(true); // State to track loading status
   const [selectedTab, setSelectedTab] = useState("Evaluation Instruments");
   const [evaluationInstruments, setEvaluationInstruments] = useState([]);
   const [evaluationTypes, setEvaluationTypes] = useState([]); 
   
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
   // STOP - Eval. Instrument data fetching
   
   // START - Eval. Instrument data fetching
   const getEvaluationTypes = async () => {
      try {
         const res = await api.get("/api/evaluation-types/");
         setEvaluationTypes(res.data);
      } catch (err) {
         alert(`Error fetching Evaluation Instrument Types: ${err.message}`);
      }
   };
   // STOP - Eval. Instrument data fetching
   
   const handleEvaluationInstrumentClick = (evaluationInstrumentId) => { // Navigates to the given specific evaluation instrument page
      navigate(`/evaluation-instruments/${evaluationInstrumentId}`);
   };
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getEvaluationInstruments();
         await getEvaluationTypes();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
      console.log("Evals: ", evaluationInstruments);
      console.log("Types: ", evaluationTypes);
   }, []);

   useEffect(() => {
      console.log("Eval Types: ", evaluationTypes);
   }, [evaluationTypes])
   
   useEffect(() => {
      setFilteredInstruments(
         evaluationInstruments
            .filter(e => e.name.toLowerCase().includes(filterName.toLowerCase()))
            .filter(e => (filterType ? e.evaluation_type_details?.evaluation_type_id === filterType : true))
            .slice(0, perPage)
      );
      console.log("Filter type: ", filterType);
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
