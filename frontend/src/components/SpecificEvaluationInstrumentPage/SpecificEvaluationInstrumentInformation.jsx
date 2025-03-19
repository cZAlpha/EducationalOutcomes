import React, { useEffect, useState } from "react";
import api from '../../api';
import LoadingIndicator from '../LoadingIndicator';
import EmbeddedTaskCard from "./EmbeddedTaskCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


function SpecificEvaluationInstrumentInformation (evaluationInstrument) {
   const navigate = useNavigate(); // For navigating to specific section page
   const [loading, setLoading] = useState(true); // State to track loading status
   const [selectedTab, setSelectedTab] = useState("Embedded Tasks");
   const [embeddedTasks, setEmbeddedTasks] = useState([]);
   const [CLOs, setCLOs] = useState([]);
   const [PLOs, setPLOs] = useState([]);
   const [evaluationInstrumentPerformance, setEvaluationInstrumentPerformance] = useState({}); // Obj to store the performance
   const [isModalOpen, setIsModalOpen] = useState(false); // To track modal visibility
   
   
   const getBackgroundColor = (score) => {
      if (score < 70) return 'bg-red-500';
      if (score < 80) return 'bg-orange-500';
      if (score < 84) return 'bg-yellow-300';
      if (score < 90) return 'bg-green-200';
      if (score < 95) return 'bg-green-400';
      return 'bg-green-600';
   };
   
   // START - Embedded Tasks data fetching
   const getEmbeddedTasks = async () => {
      try {
         const res = await api.get("/api/embedded-tasks/");
         const filteredTasks = res.data.filter(e => e.evaluation_instrument === evaluationInstrument.evaluationInstrument.evaluation_instrument_id); // Whitelist filter
         console.log("Embedded Tasks: ", filteredTasks);
         setEmbeddedTasks(filteredTasks);
      } catch (err) {
         alert(`Error fetching Embedded Tasks: ${err.message}`);
      }
   };
   // STOP  - Embedded Tasks data fetching
   
   // START - Evaluation Instrument Performance data fetching
   const getEvaluationInstrumentPerformance = async () => {
      if (evaluationInstrument.evaluationInstrument?.evaluation_instrument_id) {
         try {
            const res = await api.get(`/api/evaluation-instruments/${evaluationInstrument.evaluationInstrument?.evaluation_instrument_id}/performance/`);
            console.log("Eval. Instru. Performance: ", res.data);
            
            if (!res.data || (!res.data.clo_performance && !res.data.plo_performance && !res.data.tasks)) {
               setEvaluationInstrumentPerformance({});
               return;
            }
            
            // Map CLO IDs to their corresponding 'designation' and 'description'
            const mappedCLOPerformance = res.data.clo_performance
               ? Object.entries(res.data.clo_performance).map(([cloId, score]) => {
                     const cloObj = CLOs.find(clo => clo.clo_id === parseInt(cloId)); // Match CLO object by ID
                     return {
                        designation: cloObj ? cloObj.designation : `Unknown CLO (${cloId})`,
                        description: cloObj ? cloObj.description : "",
                        score: parseFloat(score).toFixed(2),
                     };
               })
               : [];
            
            // Map PLO IDs to their corresponding 'designation' and 'description'
            const mappedPLOPerformance = res.data.plo_performance
               ? Object.entries(res.data.plo_performance).map(([ploId, score]) => {
                     const ploObj = PLOs.find(plo => plo.plo_id === parseInt(ploId)); // Match PLO object by ID
                     return {
                        designation: ploObj ? ploObj.designation : `Unknown PLO (${ploId})`,
                        description: ploObj ? ploObj.description : "",
                        score: parseFloat(score).toFixed(2),
                     };
               })
               : [];
            
            // Map Task IDs to their corresponding 'task_number'
            const mappedTasks = res.data.tasks
            ? Object.entries(res.data.tasks).map(([taskId, score]) => {
                  const taskObj = embeddedTasks.find(task => task.embedded_task_id === parseInt(taskId)); // Match by ID
                  return {
                     task_id: parseInt(taskId),
                     name: taskObj ? `Task ${taskObj.task_number}` : `Unknown Task (${taskId})`, // Use task_number
                     text: taskObj ? taskObj.task_text : "",
                     score: parseFloat(score).toFixed(2),
                  };
            })
            : [];
            
            
            // Combine mapped CLOs, PLOs, and tasks into state
            setEvaluationInstrumentPerformance({
               CLOs: mappedCLOPerformance,
               PLOs: mappedPLOPerformance,
               tasks: mappedTasks,
               overallScore: res.data.overall_average_score // No mapping or anything needed for this so just set it
            });
         
         } catch (err) {
            alert(`Error fetching Evaluation Instrument Performance: ${err.message}`);
         }
      }
   };   
   // STOP  - Evaluation Instrument Performance data fetching
   
   // START - CLO fetching and filtering
   const getCLOs = async () => {
      const filterCLOs = (unfilteredCLOs) => {
         return unfilteredCLOs.filter(clo => clo.course === evaluationInstrument.evaluationInstrument.section_details.course);
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
   
   // START - CLO fetching and filtering
   const getPLOs = async () => {
      try {
         const res = await api.get('/api/program-learning-objectives/');
         setPLOs(res.data); 
         console.log("PLOs: ", res.data);
      } catch (err) {
         alert(`Error fetching PLOs: ${err.message}`);
      }
   };
   // STOP  - CLO fetching and filtering
   
   //  START - Delete Eval. Instrument
   const handleDelete = async () => {
      try {
         await api.delete(`/api/evaluation-instruments/${evaluationInstrument.evaluationInstrument.evaluation_instrument_id}/`);
         navigate(`/sections/${evaluationInstrument.evaluationInstrument.section_details.section_id}`); // Redirect to the section page after deletion
      } catch (err) {
         alert(`Error deleting evaluation instrument: ${err.message}`);
      }
   };
   //  STOP  - Delete Eval. Instrument
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getEmbeddedTasks();
         await getCLOs();
         await getPLOs();
         setLoading(false); // Set loading to false when all data is fetched
      };
      console.log(evaluationInstrument.evaluationInstrument)
      fetchData();
   }, []);
   
   useEffect(() => { 
      console.log("CLOs:", CLOs);
      console.log("PLOs:", PLOs);
      console.log("Embedded Tasks:", embeddedTasks);
   
      if (CLOs.length > 0 && PLOs.length > 0 && embeddedTasks.length > 0) {
         console.log("Calling getEvaluationInstrumentPerformance...");
         getEvaluationInstrumentPerformance();
      }
   }, [CLOs, PLOs, embeddedTasks]);
   
   
   // HTML STUFF
   return (
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
         {/* Header */}
         {loading || (
            <div className="flex flex-row justify-between gap-x-2 w-full mb-6 text-left">
               <div className="flex flex-col gap-y-2">
                  <h1 className="font-bold text-2xl">{evaluationInstrument.evaluationInstrument?.name}</h1>
                  <h2 className="font-semi-bold text-lg">{evaluationInstrument.evaluationInstrument?.description}</h2>
               </div>
               <h3 className={`font-bold flex items-center text-lg px-4 rounded-lg ${evaluationInstrumentPerformance?.overallScore != null ? getBackgroundColor(evaluationInstrumentPerformance.overallScore) : ''}`}>
                  {evaluationInstrumentPerformance?.overallScore?.toFixed(2) + "%" || 'N/A'}
               </h3>
               {!isModalOpen && (
                  <button
                     className="px-4 py-2 bg-red-500 text-white rounded-md"
                     onClick={() => setIsModalOpen(true)} // Show modal on button click
                  >
                     Delete
                  </button>
               )}               
            </div>
         )}
         
         {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
               <div className="bg-white p-6 rounded-lg w-1/3">
                  <h3 className="font-bold text-lg mb-4">Are you sure you want to delete this Evaluation Instrument?</h3>
                  <div className="flex justify-between">
                     <button 
                        className="px-4 py-2 bg-red-500 text-white rounded-md" 
                        onClick={handleDelete}
                     >
                        Yes, Delete
                     </button>
                     <button 
                        className="px-4 py-2 bg-gray-300 text-black rounded-md" 
                        onClick={() => setIsModalOpen(false)}
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         )}
         
         {!isModalOpen && (
            <>
               {/* Selectors */}
               <div className="w-full flex justify-between mb-4 gap-x-4">
                  <button
                     className={`px-4 py-2 rounded-md w-full font-bold
                        ${selectedTab === "Embedded Tasks" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                     onClick={() => setSelectedTab("Embedded Tasks")}
                  >
                     Embedded Tasks
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
                  {selectedTab === "Embedded Tasks" ? (
                     <div className="w-full">
                        <div className="w-full flex flex-col gap-y-4 mb-6">
                           <div className="w-full flex flex-row items-center justify-between">
                              <h3 className="font-bold text-lg">Embedded Tasks</h3>
                           </div>
                        </div>
                        
                        {loading ? (
                           <LoadingIndicator />
                        ) : embeddedTasks.length === 0 ? (
                           <p className="text-center text-gray-500">No evaluation instruments for this section</p>
                        ) : (
                           <div className="flex flex-col items-center gap-4">
                              {evaluationInstrumentPerformance.tasks ? (
                                 evaluationInstrumentPerformance.tasks.map(({ task_id, name, text, score }) => (
                                    <div key={task_id} className="w-[70%]">
                                       <EmbeddedTaskCard 
                                          questionNumber={name} 
                                          questionText={text} 
                                          questionScore={score}
                                       />
                                    </div>
                                 ))
                              ) : (
                                 <div>No info</div>
                              )}
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
                        {evaluationInstrumentPerformance ? (
                           <div className="w-full p-4 border bg-white rounded-lg shadow">
                              {/* Task Performance */}
                              <Accordion>
                                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className="font-bold text-lg">Task Performance</Typography>
                                 </AccordionSummary>
                                 <AccordionDetails>
                                    {evaluationInstrumentPerformance.tasks?.length > 0 ? (
                                       <ul className="space-y-2">
                                          {evaluationInstrumentPerformance.tasks.map(({ task_id, name, score }) => (
                                             <li key={task_id} className="bg-gray-100 p-2 rounded-lg">
                                                <div className="flex flex-col gap-y-2">
                                                   <div className={`flex flex-row gap-x-4 pl-4 rounded-md ${getBackgroundColor(score)}`}>
                                                      <h1 className="font-xl font-bold">{name}</h1>
                                                      <h1 className="font-xl font-bold">{score}%</h1>
                                                   </div>
                                                </div>
                                             </li>
                                          ))}
                                       </ul>
                                    ) : (
                                       <p className="text-gray-500">No Task Performance data available.</p>
                                    )}
                                 </AccordionDetails>
                              
                              </Accordion>
                              
                              {/* CLO Performance */}
                              <Accordion>
                                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className="font-bold text-lg">CLO Performance</Typography>
                                 </AccordionSummary>
                                 <AccordionDetails>
                                    {evaluationInstrumentPerformance.CLOs?.length > 0 ? (
                                       <ul className="space-y-2">
                                          {evaluationInstrumentPerformance.CLOs.map(({ designation, description, score }) => (
                                             <li key={designation} className="bg-gray-100 p-2 rounded-lg">
                                                <div className="flex flex-col gap-y-2">
                                                   <div className={`flex flex-row gap-x-4 pl-4 rounded-md ${getBackgroundColor(score)}`}>
                                                      <h1 className="font-xl font-bold">{designation}</h1>
                                                      <h1 className="font-xl font-bold">{score}%</h1>
                                                   </div>
                                                   <p className="text-left pl-4 pr-4 pb-2">{description}</p>
                                                </div>
                                             </li>
                                          ))}
                                       </ul>
                                    ) : (
                                       <p className="text-gray-500">No CLO data available.</p>
                                    )}
                                 </AccordionDetails>
                              </Accordion>
                              
                              {/* PLO Performance */}
                              <Accordion>
                                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className="font-bold text-lg">PLO Performance</Typography>
                                 </AccordionSummary>
                                 <AccordionDetails>
                                    {evaluationInstrumentPerformance.PLOs?.length > 0 ? (
                                       <ul className="space-y-2">
                                          {evaluationInstrumentPerformance.PLOs.map(({ designation, description, score }) => (
                                             <li key={designation} className="bg-gray-100 p-2 rounded-lg">
                                                <div className="flex flex-col gap-y-2">
                                                   <div className={`flex flex-row gap-x-4 pl-4 rounded-md ${getBackgroundColor(score)}`}>
                                                      <h1 className="font-xl font-bold">{designation}</h1>
                                                      <h1 className="font-xl font-bold">{score}%</h1>
                                                   </div>
                                                   <p className="text-left pl-4 pr-4 pb-2">{description}</p>
                                                </div>
                                             </li>
                                          ))}
                                       </ul>
                                    ) : (
                                       <p className="text-gray-500">No PLO data available.</p>
                                    )}
                                 </AccordionDetails>
                              </Accordion>
                           </div>
                        ) : (
                           <p className="text-center text-gray-500">No performance data available</p>
                        )}
                     </motion.div>
                  )}
               </div>
            </>
         )}         
      </div>
   );
}

export default SpecificEvaluationInstrumentInformation;
