import React, { useEffect, useState } from "react";
import api from '../../api';
import LoadingIndicator from '../LoadingIndicator';
import EvaluationInstrumentCard from "./EvaluationInstrumentCard";
import AddEvaluationInstrumentButton from "./AddNewEvaluationInstrumentButton";
import FilterEvaluationInstrumentsBar from "./FilterEvaluationInstrumentsBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from '@mui/icons-material/Settings';


function SpecificSectionInformation (section) {
   const navigate = useNavigate(); // For navigating to specific section page
   const [loading, setLoading] = useState(true); // State to track loading status
   const [selectedTab, setSelectedTab] = useState("Evaluation Instruments");
   const [evaluationInstruments, setEvaluationInstruments] = useState([]);
   const [evaluationTypes, setEvaluationTypes] = useState([]); 
   const [CLOs, setCLOs] = useState([]);
   const [PLOs, setPLOs] = useState([]);
   const [sectionPerformance, setSectionPerformance] = useState({}); // Obj to store the performance of a section
   const [semesters, setSemesters] = useState(null); // To store all semesters grabbed from the backend (used to populate the dropdown menu for the edit modal)
   const [existingSectionNumbers, setExistingSectionNumbers] = useState([]); // To store all existing section numbers, as to not allow the user to repeat a section number

   // Modal Variables
      // START - Edit Modal Variables
   const [isEditModalOpen, setIsEditModalOpen] = useState(false); // To track edit modal visibility
   const [selectedSectionNumber, setSelectedSectionNumber] = useState('');
   const [selectedSemester, setSelectedSemester] = useState(null);
   const [selectedCRN, setSelectedCRN] = useState('');
      // END - Edit Modal Variables
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To track delete modal visibility
   
   // Filtering Variables
   const [filteredInstruments, setFilteredInstruments] = useState([]);
   const [filterName, setFilterName] = useState("");
   const [filterType, setFilterType] = useState("");
   const [perPage, setPerPage] = useState(10);
   
   
   const getBackgroundColor = (score) => {
      if (score < 70) return 'bg-red-500';
      if (score < 80) return 'bg-orange-500';
      if (score < 84) return 'bg-yellow-300';
      if (score < 90) return 'bg-green-200';
      if (score < 95) return 'bg-green-400';
      return 'bg-green-600';
   };
   
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
   
   // START  - Semester fetching
   const getSemesters = async () => {
      try {
         const res = await api.get('/api/semesters/');
         setSemesters(res.data);
      } catch (err) {
         alert(`Error fetching Semesters: ${err.message}`);
      }
   };
   // STOP  - Semester fetching
   
   // START - Existing Section Numbers Fetching
   const getAllSectionsNumbers = async () => {
      // Step 1: Get the section's course
      let courseId = section.section.course;
      let currentSectionNumber = section.section.section_number;
      // Step 2: Query the backend for all sections of the given courseId, then push them into the existingSectionNumbers array.
      if (courseId) {
         try {
            const res = await api.get(`/api/courses/${courseId}/sections/`);
            const otherSectionNumbers = [];
            res.data.forEach(sectionNumber => {
               if (sectionNumber !== currentSectionNumber) {
                  otherSectionNumbers.push(sectionNumber);
               }
            });
            setExistingSectionNumbers(otherSectionNumbers);
         } catch (err) {
            alert(`Error fetching Semesters: ${err.message}`);
         }
      } else {
         alert("CourseId could not be parsed and therefore, all sections could not be fetched.")
      }
   };
   // STOP  - Existing Section Numbers Fetching
   
   // START - Section Performance data fetching
   const getSectionPerformance = async () => {
      try {
         const res = await api.get(`/api/sections/${section.section.section_id}/performance/`);
         
         if (!res.data || (!res.data.clo_performance && !res.data.plo_performance)) {
            setSectionPerformance({});
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
         
         // Combine CLO and PLO performance into state
         setSectionPerformance({
            CLOs: mappedCLOPerformance,
            PLOs: mappedPLOPerformance,
         });
      } catch (err) {
         alert(`Error fetching Performance Data: ${err.message}`);
      }
   };   
   // STOP  - Section Performance data fetching
   
   // START - Section Edit
   const handleSaveSectionChanges = async () => {
      // Validate inputs
      if (selectedCRN.length !== 5) {
      alert('CRN must be exactly 5 digits');
      return;
      }
      
      if (existingSectionNumbers.includes(selectedSectionNumber)) {
      alert('Section number already exists for this course');
      return;
      }
      
      try {
      // Prepare the update data
      const updateData = {
         section_number: selectedSectionNumber,
         semester: selectedSemester,
         crn: selectedCRN
      };
      
      // Send the PATCH request with the update data
      const response = await api.patch(
         `/api/sections/${section.section.section_id}/`,
         updateData
      );
      
      if (response.status === 200) {
         alert('Section successfully updated.');
         navigate("/sections/");
      } else {
         alert(`Error updating section. Status code: ${response.status}`);
      }
      } catch (err) {
      alert(`Error updating section: ${err.message}`);
      } finally {
      setIsEditModalOpen(false);
      }
   };
   // STOP  - Section Edit
   
   // START - Section Delete 
   const handleRemoveSection = async () => {
      if (section.section.section_id) {
         try {
            // Send the DELETE request
            const response = await api.delete(`/api/sections/${section.section.section_id}/`);
            if (response.status == 200) { // If deletion was successful
               alert('Section successfully deleted.');
               navigate("/sections/");
            } else { // Uncaught failure
               alert("Error deleting section. Status code not recognized, was not 200, was: ", response.status);
            }         
         } catch (err) {
            alert(`Error deleting section: ${err.message}`);
         }
      } else {
         alert("ERROR | No section ID detected. Deletion could not be completed");
      }
   };
   // STOP  - Section Delete 
   
   // START - Handle Click of an Evaluation Instrument Instance
   const handleEvaluationInstrumentClick = (evaluationInstrumentId) => { // Navigates to the given specific evaluation instrument page
      navigate(`/evaluation-instruments/${evaluationInstrumentId}`);
   };
   // STOP  - Handle Click of an Evaluation Instrument Instance
   
   // START - Handle Opening of the Edit Modal
   const handleOpenEditModal = () => {
      setSelectedSectionNumber(section.section.section_number || '');
      setSelectedSemester(section.section.semester || null); // Set to current semester
      setSelectedCRN(section.section.crn || '');
      setIsEditModalOpen(true);
   };
   // STOP  - Handle Opening of the Edit Modal
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         await getEvaluationInstruments();
         await getEvaluationTypes();
         await getCLOs();
         await getPLOs();
         await getSemesters();
         await getAllSectionsNumbers();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
   }, []);
   
   useEffect(() => { // Performance Report Call
      if (CLOs.length > 0 && PLOs.length > 0) {
         getSectionPerformance();
      }
   }, [CLOs, PLOs]); // This ensures `getSectionPerformance()` runs only after `CLOs` is updated
   
   useEffect(() => {
      setFilteredInstruments(
         evaluationInstruments
            .filter(e => e.name.toLowerCase().includes(filterName.toLowerCase()))
            .filter(e => (filterType ? e.evaluation_type_details?.evaluation_type_id === filterType : true))
            .slice(0, perPage)
      );
   }, [filterName, filterType, perPage, evaluationInstruments]); // Depend on filters
   
   
   // TESTING ONLY
   useEffect(() => {
      console.log("existingSectionNumbers: ", existingSectionNumbers);
   }, [existingSectionNumbers])
   
   
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
            <button
               className={`px-4 py-2 rounded-md w-full font-bold
                  ${selectedTab === "Settings" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
               onClick={() => setSelectedTab("Settings")}
            >
               <SettingsIcon />
            </button>
         </div>
         
         {/* Edit Modal */}
         {isEditModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[60%] md:w-1/4">
               <h3 className="font-bold text-lg mb-4">Edit Section Details</h3>
               
               <div className="flex flex-col gap-4 mb-6">
                  {/* Section Number */}
                  <TextField
                     label="Section Number"
                     variant="outlined"
                     value={selectedSectionNumber}
                     onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or alphanumeric strings up to 5 chars
                        if (value === '' || (value.length <= 5 && /^[a-zA-Z0-9]*$/.test(value))) {
                           setSelectedSectionNumber(value);
                        }
                     }}
                     error={
                        selectedSectionNumber === '' || // Empty field error
                        existingSectionNumbers.includes(selectedSectionNumber.toUpperCase()) || // Duplicate error
                        !/^[a-zA-Z0-9]{1,5}$/.test(selectedSectionNumber) // Invalid format error
                     }
                     onBlur={() => {
                        // Convert to uppercase and validate for duplicates
                        const upperValue = selectedSectionNumber.toUpperCase();
                        if (selectedSectionNumber !== '' && existingSectionNumbers.includes(upperValue)) {
                           alert(`Section number ${upperValue} already exists!`);
                           setSelectedSectionNumber('');
                        } else if (selectedSectionNumber !== '') {
                           // Auto-uppercase the value on blur
                           setSelectedSectionNumber(upperValue);
                        }
                     }}
                     fullWidth
                     helperText={
                        selectedSectionNumber === '' // If there's nothing entered, tell the user to enter something
                           ? "You must have a section number!"
                           : (existingSectionNumbers.includes(selectedSectionNumber.toUpperCase()))
                              ? "This section number already exists!"
                              : "Enter 1-5 alphanumeric characters (e.g., '01' or 'R01')"
                     }
                     sx={{
                           '& input': {
                           textTransform: 'uppercase',
                           },
                        }}
                     slotProps={{
                        input: {
                        maxLength: 5,
                        },
                     }}
                  />
                  
                  {/* Semester Dropdown */}
                  <FormControl fullWidth>
                  <InputLabel id="semester-label">Semester</InputLabel>
                  <Select
                     labelId="semester-label"
                     value={selectedSemester || ''}
                     onChange={(e) => setSelectedSemester(e.target.value)}
                     label="Semester"
                  >
                     {semesters ? (
                        semesters.map((semester) => (
                        <MenuItem 
                           key={semester.semester_id} 
                           value={semester.semester_id} // Use semester_id as the value
                        >
                           {semester.designation}
                        </MenuItem>
                        ))
                     ) : (
                        <MenuItem disabled>Loading semesters...</MenuItem>
                     )}
                  </Select>
                  </FormControl>
                  
                  {/* CRN Input */}
                  <TextField
                     label="CRN"
                     variant="outlined"
                     value={selectedCRN}
                     onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,5}$/.test(value)) setSelectedCRN(value);
                     }}
                     fullWidth
                     error={selectedCRN.length > 0 && selectedCRN.length !== 5}
                     helperText={
                        selectedCRN.length > 0 && selectedCRN.length !== 5 ? 'CRN must be exactly 5 digits' : ''
                     }
                  />
                  </div>
                  
                  <div className="flex justify-between">
                  {/* Save Button */}
                  <Button
                     color="primary"
                     variant="outlined"
                     disabled={selectedCRN.length !== 5 || selectedSectionNumber.length < 1 || existingSectionNumbers.includes(selectedSectionNumber)}
                     sx={{
                        minWidth: '40px',
                        minHeight: '50px',
                        borderColor: 'primary.main',
                        '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        borderColor: 'primary.main',
                        },
                     }}
                     onClick={handleSaveSectionChanges}
                  >
                     Save
                  </Button>
                  
                  {/* Cancel Button */}
                  <Button
                     variant="contained"
                     sx={{
                        minWidth: '40px',
                        minHeight: '50px',
                        backgroundColor: '#757575',
                        color: 'white',
                        boxShadow: 'none',
                        '&:hover': {
                        backgroundColor: '#616161',
                        },
                     }}
                     onClick={() => setIsEditModalOpen(false)}
                  >
                     Cancel
                  </Button>
               </div>
            </div>
         </div>
         )}
         
         {/* Delete Modal */}
         {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
               <div className="bg-white p-6 rounded-lg w-[60%] md:w-1/4">
                  <h3 className="font-bold text-lg mb-2">Are you sure you want to delete this Section?</h3>
                  <p className="text-md italic mb-4 text-left pb-4">This will permanently delete this Section AND ALL OF ITS ASSOCIATED OBJECTS. All Evaluation Instruments and associated grades will be LOST FOREVER.</p>
                  <div className="flex justify-between">
                     {/* Delete Button */}
                     <Button color="error" variant="outlined" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           borderColor: 'error.main', // Border color for the outlined variant
                           '&:hover': {
                              backgroundColor: 'error.main', // Background color when hovered
                              color: 'white', // Text color changes to white on hover
                              borderColor: 'error.main', // Ensure border color stays the same
                           },
                        }}
                        onClick={handleRemoveSection}
                     >
                        Yes, Delete
                     </Button>
                     {/* Cancel Button */}
                     <Button 
                        variant="contained" 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                           backgroundColor: '#757575', // Darker gray fill
                           color: 'white',              // White text
                           boxShadow: 'none',           // Remove drop shadow
                           '&:hover': {
                              backgroundColor: '#616161', // Even darker gray on hover
                           },
                        }}
                        onClick={() => setIsDeleteModalOpen(false)}
                     >
                        Cancel
                     </Button>
                  </div>
               </div>
            </div>
         )}
         
         {/* Display Section */}
         {(!isEditModalOpen && !isDeleteModalOpen) && (
            <div className="w-full p-4 border rounded-md bg-gray-100 min-h-[200px]">
               {selectedTab === "Evaluation Instruments" ? (
                  <div className="w-full">
                     <div className="w-full flex flex-col gap-y-4 mb-6">
                        <div className="w-full flex flex-row items-center justify-between">
                           <h3 className="font-bold text-lg">Evaluation Instruments</h3>
                           {section.section && section.section.section_id && (
                              <AddEvaluationInstrumentButton sectionId={section.section.section_id} />
                           )}
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
               ) : selectedTab === "Performance" ? (
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
                           {/* CLO Performance */}
                           <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                 <Typography className="font-bold text-lg">CLO Performance</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                 {sectionPerformance.CLOs?.length > 0 ? (
                                    <ul className="space-y-2">
                                       {sectionPerformance.CLOs.map(({ designation, description, score }) => (
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
                                 {sectionPerformance.PLOs?.length > 0 ? (
                                    <ul className="space-y-2">
                                       {sectionPerformance.PLOs.map(({ designation, description, score }) => (
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
               ) : selectedTab === "Settings" ? (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4 }}
                     className="w-full"
                  >
                     <h3 className="font-bold text-lg mb-4">Settings</h3>
                     <div className="w-full p-4 border bg-white rounded-lg shadow">
                        <div className="flex flex-col justify-center items-center gap-4 mt-4">
                           <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-[60%] px-4 py-2 rounded-md">
                              <p className="text-xl text-black">Edit this Section?</p>
                              {/* Edit Button */}
                              <Button 
                                 color="warning" 
                                 variant="contained"
                                 sx={{
                                    width: '80px',
                                    minHeight: '50px',
                                    borderColor: 'warning.main',
                                    '&:hover': {
                                       backgroundColor: 'warning.main',
                                       color: 'white',
                                       borderColor: 'warning.main',
                                    },
                                 }}
                                 onClick={handleOpenEditModal}
                              >
                                 Edit
                              </Button>
                           </div>
                           <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-[60%] px-4 py-2 rounded-md">
                              <p className="text-xl text-black">Delete this Section?</p>
                              {/* Delete Button */}
                              <Button 
                                 color="error" 
                                 variant="outlined"
                                 sx={{
                                    width: '80px',
                                    minHeight: '50px',
                                    borderColor: 'error.main',
                                    '&:hover': {
                                       backgroundColor: 'error.main',
                                       color: 'white',
                                       borderColor: 'error.main',
                                    },
                                 }}
                                 onClick={() => setIsDeleteModalOpen(true)}
                              >
                                 DELETE
                              </Button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ) :
               (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4 }}
                     className="w-full"
                  >
                     <div>Please select a tab, no tab selected.</div>
                  </motion.div>
               )
               }
            </div>
         )}
      </div>
   );
}

export default SpecificSectionInformation;
