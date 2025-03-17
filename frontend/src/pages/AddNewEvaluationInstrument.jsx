import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, IconButton, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { ArrowForward, ArrowBack, ResetTvSharp } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import api from '../api';


const AddEvaluationInstrument = () => {
   const { sectionId } = useParams(); // To get the section id
   const [loading, setLoading] = useState(true); // State to track loading status
   const [evaluationTypes, setEvaluationTypes] = useState([]); // Keeps a list of all evaluation types fetched from the server
   const [course, setCourse] = useState({});
   
   
   // Step 1: Instrument Information
   const [instrumentInfo, setInstrumentInfo] = useState({
      name: "",
      description: "",
      type: "",
      file: null,
   });
   const [students, setStudents] = useState([]); // Array to hold students and their grades on questions
   
   // Step 2: CLO Mapping
   const [tasks, setTasks] = useState([]);
   const [cloMappings, setCloMappings] = useState([]);
   const [cloList, setCloList] = useState([]); // Course Learning Objectives
   
   // Step tracking
   const [currentStep, setCurrentStep] = useState(1);
   
   // Handle form input changes
   const handleInstrumentChange = (e) => {
      const { name, value } = e.target;
      setInstrumentInfo((prev) => ({ ...prev, [name]: value }));
   };
   
   const handleFileChange = (e) => {
      setInstrumentInfo((prev) => ({ ...prev, file: e.target.files[0] }));
   };
   
   // handleCloMappingChange function
   const handleCloMappingChange = (taskId, selectedCloIds) => {
      setCloMappings((prevMappings) => {
         const updatedMappings = prevMappings.filter(mapping => mapping.taskId !== taskId); // Remove existing mappings for the task
         updatedMappings.push({
            taskId,
            cloIds: selectedCloIds, // Update with new CLOs
         });
         console.log("Updated Task CLO Mapping | Task:", taskId, "CLO(s): ", selectedCloIds)
         return updatedMappings;
      });
   };   
   
   // Step 1 validation
   const isStep1Valid = instrumentInfo.name && instrumentInfo.type && instrumentInfo.file;
   
   // Step 2 validation (CLO mappings should not be empty)
   const isStep2Valid = cloMappings.length > 0 && cloMappings.every(mapping => mapping.cloId);
   
   // Handle navigation between steps
   const handleNext = () => {
      if (currentStep === 1 && isStep1Valid) {
         setCurrentStep(2);
      }
   };
   
   const handlePrev = () => {
      if (currentStep === 2) {
         setCurrentStep(1);
      }
   };
   
   // Handle file parsing (CSV and Excel)
   const handleFileParse = (file) => {
      if (!file) return;
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === "csv") {
         // Parse CSV
         Papa.parse(file, {
            complete: (result) => {
               console.log("CSV parsing complete:", result);
               
               const parsedData = result.data; // Array of rows from CSV
               
               // Assuming the first row contains headers, we'll start parsing from the second row
               const students = [];
               const allQuestions = [];
               
               // Parse each row for student and question data
               parsedData.slice(1).forEach(row => {
                  // Student information
                  const username = row[0];
                  const lastName = row[1];
                  const firstName = row[2];
                  const fullName = row[3];
                  
                  // To track questions answered by each student
                  const studentQuestions = [];
                  
                  // Parse questions and their corresponding answers
                  for (let i = 4; i < row.length; i += 6) {
                     const questionId = row[i];
                     const questionText = row[i + 1];
                     const answer = row[i + 2];
                     const possiblePoints = row[i + 3];
                     const autoScore = row[i + 4];
                     const manualScore = row[i + 5];
                     
                     // Add the question to the list if not already present
                     if (!allQuestions.some(q => q.questionId === `q${questionId}`)) {
                        allQuestions.push({
                           questionId: `q${questionId}`,
                           questionNumber: questionId,
                           questionText: questionText
                        });
                     }
                     
                     // Add this question to the student's answered questions
                     studentQuestions.push({
                        questionId: `q${questionId}`,  // Ensure each question has a unique ID (q1, q2, q3, etc.)
                        answer: answer,
                        possiblePoints: possiblePoints,
                        autoScore: autoScore,
                        manualScore: manualScore
                     });
                  }
                  
                  // Add the student data with questions
                  students.push({
                     username: username,
                     lastName: lastName,
                     firstName: firstName,
                     fullName: fullName,
                     questions: studentQuestions
                  });
               });
               
               let jsonData = {
                  students: students,
                  tasks: allQuestions
               }
               console.log("Final Parsed Data:", jsonData);
               setStudents(students); // Set the students (including their scores) array to the students parsed from the CSV 
               setTasks(allQuestions); // Set the tasks array to the questions parsed from the CSV
            },
            header: false, // Set to true if you have headers in your CSV
         });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
         // Parse Excel (Add Excel parsing logic here)
         console.log("Excel file selected", file);
      } else {
         alert("Invalid file type. Only CSV and Excel files are allowed.");
      }
   };
   
   // START - Course data fetching
   const getCourse = async () => {
      if (sectionId) {
         try {
            const res = await api.get(`/api/sections/${sectionId}`);
            if (res.data.course) {
               let course = res.data.course_details.course_id; // Make new section var to use
               console.log("FOUND COURSE: ", course)
               setCourse(course);
            }
         } catch (err) {
            alert(`Error fetching Course: ${err.message}`);
         }
      } else {
         console.log("Cannot fetch course, as 'sectionId' parameter is not valid")
      }
   };
   // STOP  - Course data fetching
   
   // START - CLO data fetching
   const getCLOs = async () => {
      const filterCLOs = (unfilteredCLOs) => {
         return unfilteredCLOs.filter(clo => clo.course === parseInt(course)); // Cross checks the IDs of the courses
      };   
      try {
         const res = await api.get('/api/course-learning-objectives/');
         console.log("CLOs: ", filterCLOs(res.data));
         setCloList(filterCLOs(res.data)); // Filter and then set the CLOs
      } catch (err) {
         alert(`Error fetching CLOs: ${err.message}`);
      }
   };
   // STOP  - CLO data fetching
   
   // START - Evaluation Instrument Types data fetching
   const getEvaluationInstrumentTypes = async () => {
      try {
         const res = await api.get('/api/evaluation-types/');
         setEvaluationTypes(res.data);
      } catch (err) {
         alert(`Error fetching Evaluation Instrument Types: ${err.message}`);
      }
   };
   // STOP  - Evaluation Instrument Types data fetching
   
   // Handle form submission
   const handleSubmit = async () => {
      const formData = {
         instrumentInfo, // Contains info. like the name and description, type of the eval. instrument
         students, // Contains all students who took the eval. instrument, as well as their grades on each task
         cloMappings, // Contains all Task <-> CLO mappings
      };
      
      // Perform API call to submit the form data
      console.log("Form Data: ", formData);
      try {
         // TODO: Adjust the route for creating new evaluation instruments to create the CLO mappings too!!!
         // Also make sure the correct route it being used!
         //const res = await api.post('/api/instruments/', formData);
         //console.log("Response from server:", res.data);
         //alert("Evaluation Instrument Data Successfully Sent!");
         console.log("If you see this, you need to check the comments above this log statement")
      } catch (err) {
         console.error("Error posting Instrument:", err.response?.data || err.message);
         alert(`Error posting Instrument: ${err.response?.data?.error || err.message}`);
      }
   };
   
   const handleFileRemove = () => {
      // Reset the file state to null or empty along with all applicable other variables
      setInstrumentInfo({ ...instrumentInfo, file: null });
   };
   
   useEffect(() => { // Call CLO get function only once the course is set
      if (course) { // Check that the course exists
         getCLOs();
      } else {
         console.log("Couldn't ascertain course, fetching course again...");
         getCourse();
      }
   }, [course]);
   
   useEffect(() => { // ON COMPONENT MOUNT
      const fetchData = async () => {
         console.log("Getting course...")
         await getCourse();
         console.log("Getting eval. instruments...")
         await getEvaluationInstrumentTypes();
         setLoading(false); // Set loading to false when all data is fetched
      };
      
      fetchData();
   }, []);
   
   useEffect(() => {
      console.log("CLO Mappings: ", cloMappings);
   }, [cloMappings]);
   
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="p-10 bg-white rounded-md">
         <Box sx={{ maxWidth: 600, margin: "auto" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ textAlign: "center", marginBottom: 3 }}>
               Add New Evaluation Instrument
            </Typography>
            
            {/* Step 1: Instrument Information */}
            {currentStep === 1 && (
               <Box>
                  <TextField
                     fullWidth
                     label="Instrument Name"
                     name="name"
                     value={instrumentInfo.name}
                     onChange={handleInstrumentChange}
                     margin="normal"
                  />
                  <TextField
                     fullWidth
                     label="Description"
                     name="description"
                     value={instrumentInfo.description}
                     onChange={handleInstrumentChange}
                     margin="normal"
                  />
                  
                  <FormControl fullWidth margin="normal">
                     <InputLabel>Type</InputLabel>
                     <Select
                        label="Type"
                        name="type"
                        value={instrumentInfo.type}
                        onChange={handleInstrumentChange}
                        sx={{ textAlign: "left" }}
                     >
                        {evaluationTypes.map((type) => (
                           <MenuItem key={type.id} value={type.type_name}>
                              {type.type_name}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
                  
                  {/* File Upload */}
                  <Button 
                     sx={{ marginTop: 4 }} 
                     variant="contained" 
                     color="primary" 
                     component="label" 
                     fullWidth 
                     disabled={!!instrumentInfo.file} // Disable if file exists
                  >
                     {instrumentInfo.file ? "File Uploaded" : "Upload File (CSV/Excel)"}
                     <input
                        type="file"
                        hidden
                        onChange={(e) => {
                           handleFileChange(e);
                           handleFileParse(e.target.files[0]);
                        }}
                     />
                  </Button>
                  
                  {/* Display file name and Remove button if file exists */}
                  {instrumentInfo.file && (
                     <div className="w-full flex justify-center">
                        <div className="flex gap-2 items-center justify-center gap-x-8 w-[60%]"> 
                           <Typography sx={{ marginTop: 2 }}>{instrumentInfo.file.name}</Typography>
                           <Button 
                              sx={{ marginTop: 2 }} 
                              variant="outlined" 
                              color="error" 
                              onClick={() => {
                                 // Handle file removal logic
                                 handleFileRemove();
                              }}
                           >
                              Remove File
                           </Button>
                        </div>
                     </div>
                  )}
               </Box>
            )}
            
            {/* Step 2: CLO Mapping */}
            {currentStep === 2 && (
               <Box>
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>
                     Map Tasks to CLOs
                  </Typography>
                  {tasks.map((task) => (
                     <Box key={task.questionId} sx={{ marginBottom: 2 }}>
                        <div className="flex flex-col gap-y-2">
                           <Typography variant="body1">{task.questionNumber}</Typography>
                           <Typography variant="body1">{task.questionText.slice(0, 100)}</Typography>
                        </div>
                        <FormControl fullWidth margin="normal">
                           <InputLabel>CLOs</InputLabel>
                           <Select
                              value={cloMappings.find((mapping) => mapping.taskId === task.questionId)?.cloIds || []} //Use task.questionId
                              onChange={(e) => handleCloMappingChange(task.questionId, e.target.value)} //Use task.questionId
                              label="CLO"
                              multiple
                              renderValue={(selected) => {
                                 // Map selected CLO IDs to their designations
                                 const selectedCloDesignations = cloList
                                    .filter(clo => selected.includes(clo.clo_id))
                                    .map(clo => clo.designation);
                                 return selectedCloDesignations.join(", "); // Show designations only, joined by comma
                              }}
                              sx={{
                                 "& .MuiSelect-select": {
                                    textAlign: "left",
                                 },
                                 "& .Mui-selected": {
                                    backgroundColor: "#004080", // Darker blue for selected items
                                    color: "white", // White text for contrast
                                 },
                                 "& .MuiSelect-icon": {
                                    color: "#004080", // Darker blue for the dropdown icon
                                 }
                              }}
                           >
                              {cloList.map((clo) => (
                                 <MenuItem key={clo.clo_id} value={clo.clo_id}>
                                    {clo.designation} : {clo.description}
                                 </MenuItem>
                              ))}
                           </Select>
                        </FormControl>
                     </Box>
                  ))}
               </Box>
            )}
            
            {/* Navigation buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
               {currentStep === 2 && (
               <IconButton onClick={handlePrev}>
                  <ArrowBack />
               </IconButton>
               )}
               {currentStep === 1 && (
               <IconButton onClick={handleNext} disabled={!isStep1Valid}>
                  <ArrowForward />
               </IconButton>
               )}
               {currentStep === 2 && (
               <Button variant="contained" onClick={handleSubmit} disabled={!isStep2Valid}>
                  Submit
               </Button>
               )}
            </Box>
         </Box>
         </div>
      </div>
   );
};

export default AddEvaluationInstrument;
