import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, IconButton, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { ArrowForward, ArrowBack } from "@mui/icons-material";
import api from '../api';
import { Link } from 'react-router-dom'; // Import Link if using react-router


const AddNewCourseManual = () => {
   // START - Variables to hold data
   const [programs, setPrograms] = useState([]); // Programs list
   const [accreditationOrganizations, setAccreditationOrganizations] = useState([]); // Accreditation Organizations list
   const [selectedAccreditationOrg, setSelectedAccreditationOrg] = useState(null); // Selected a_org (not a list of all of them!)
   const [accreditationVersions, setAccreditationVersions] = useState([]); // Accreditation Versions list
   const [PLOs, setPLOs] = useState([]); // Program Learning Objectives list
   // NOTE: The view from the backend disallows non-super users from GET calling all users, therefore the GET call will only return the current user
   const [instructor, setInstructor] = useState(null); 
   // STOP  - Variables to hold data
   
   // START - Program data fetching
   const getPrograms = async () => {
      try {
         const res = await api.get('/api/programs/');
         setPrograms(res.data);
      } catch (err) {
         alert(`Error fetching Programs: ${err.message}`);
      }
   };
   // STOP  - Program data fetching
   
   // START - Accreditation Organization data fetching
   const getAccreditationOrganizations = async () => {
      try {
         const res = await api.get('/api/accreditation-organizations/');
         setAccreditationOrganizations(res.data);
      } catch (err) {
         alert(`Error fetching Accreditation Organizations: ${err.message}`);
      }
   };
   // STOP  - Accreditation Organization data fetching
   
   // START - Accreditation Organization data fetching
   const getAccreditationVersions = async () => {
      try {
         const res = await api.get('/api/accreditation-versions/');
         setAccreditationVersions(res.data);
      } catch (err) {
         alert(`Error fetching Accreditation Versions: ${err.message}`);
      }
   };
   // STOP  - Accreditation Organization data fetching
   
   // START - Program Learning Objectives data fetching
   const getPLOs = async () => {
      try {
         const res = await api.get('/api/program-learning-objectives/');
         setPLOs(res.data);
      } catch (err) {
         alert(`Error fetching Program Learning Objectives: ${err.message}`);
      }
   };
   // STOP  - Program Learning Objectives data fetching
   
   // START - User data fetch
   const getInstructor = async () => {
      try {
         const res = await api.get('/api/users/');
         console.log(res.data[0]); // Log the response to check its structure
         setInstructor(res.data[0]);
      } catch (err) {
         alert(`Error fetching Instructor: ${err.message}`);
      }
   };
   // STOP  - User data fetch
   
   // Step 1: Basic Course Information
   const [courseInfo, setCourseInfo] = useState({
      program: "", // Upon creation, this 'program' should be used to create a Program <-> Course mapping, NOT setting the 'program' attr. of the new course, as that doesn't work and isn't part of the schema!
      accreditationOrganization: "", // DO NOT USE A_ORG FOR ANYTHING, COURSE INSTANCES DO NOT STORE THIS
      accreditationVersion: "", // You must store 'accreditationVersion' as a FK in the new Course instance
      courseNumber: "", // This should be used
      courseName: "", // This should be used
      description: "", // This should be used
   });
   
   // Step 2: CLOs (Course Learning Objectives)
   const [cloList, setCloList] = useState([]);
   
   // Step 3: PLOs (Program Learning Outcomes)
   const [ploMappings, setPloMappings] = useState([]);
   
   // Keep track of the current step the user is on
   const [currentStep, setCurrentStep] = useState(1);
   
   // Step 1 validation
   const isStep1Valid = courseInfo.accreditationVersion && courseInfo.courseNumber && courseInfo.courseName;
   
   // Step 2 validation (CLO designation should be unique and in range 1-20)
   const isStep2Valid = cloList.length > 0 && cloList.every(clo => clo.designation >= 1 && clo.designation <= 20 && !cloList.some((otherClo, index) => otherClo.designation === clo.designation && index !== cloList.indexOf(clo)));
      // Disable "Add Another CLO" button unless the last CLO is valid
      const isAddCloDisabled = !(cloList.length === 0 || 
         (cloList[cloList.length - 1].designation && 
         cloList[cloList.length - 1].description && 
         !cloList.some((clo, index) => clo.designation === cloList[cloList.length - 1].designation && index !== cloList.length - 1))
      );
   
   // Handle form input changes
   const handleCourseInfoChange = (e) => {
      const { name, value } = e.target;
      setCourseInfo((prev) => ({ ...prev, [name]: value }));
   };
   
   const handleAccreditationOrgChange = (event) => {
      const selectedOrgId = event.target.value;
      setSelectedAccreditationOrg(selectedOrgId);
      
      // Update the course info object with the selected accreditation organization
      setCourseInfo(prevCourseInfo => ({
         ...prevCourseInfo,
         accreditationOrganization: selectedOrgId
      }));
   };
   
   const handleCloChange = (index, field, value) => {
      const newCloList = [...cloList];
      newCloList[index][field] = value;
      setCloList(newCloList);
   };
   
   const handleAddClo = () => {
      setCloList([...cloList, { designation: "", description: "", created_by: instructor?.user_id}]);
   };
   
   const handleFilterPLOs = () => { 
      setPLOs((prevPlos) => prevPlos.filter(plo => plo.a_version === courseInfo.accreditationVersion));
   };
   
   const handlePloMappingChange = (cloDesignation, ploId) => {
      // Create a new copy of the PLO mappings to ensure immutability
      const newPLOMappings = [...ploMappings];
      
      // Check if this CLO is already mapped to the PLO
      const existingMappingIndex = newPLOMappings.findIndex(mapping => mapping.cloDesignation === cloDesignation && mapping.plo === ploId);
      
      if (existingMappingIndex === -1) {
         // If no mapping exists, create a new mapping and add it
         newPLOMappings.push({
            cloDesignation,
            plo: ploId,
         });
      }
      
      // Update the state with the new PLO mappings
      setPloMappings(newPLOMappings);
   };
   
   const handleRemovePloMapping = (cloDesignation, ploId) => {
      setPloMappings((prevMappings) =>
         prevMappings.filter(mapping => !(mapping.cloDesignation === cloDesignation && mapping.plo === ploId))
      );
   };
   
   const handleNext = () => {
      if (currentStep < 3) {
         setCurrentStep(currentStep + 1);
      }
   };
   
   const handlePrev = () => {
      if (currentStep > 1) {
         setCurrentStep(currentStep - 1);
      }
   };
   
   const handleDone = async () => {      
      let formData = { // The data to be sent to the server
         "course": courseInfo,
         "clos": cloList,
         "plo_clo_mappings": ploMappings
      };
      
      console.log("Form Data: ", formData);
      try {
         const res = await api.post('/api/courses/', formData);
         console.log("Response from server:", res.data); // REMOVE FOR PRODUCTION
         alert("Course Data Successfully Sent!");
      } catch (err) {
         console.error("Error posting Course:", err.response?.data || err.message);
         alert(`Error posting Course: ${err.response?.data?.error || err.message}`);
      }
   };

   // START - FILTERS PLOs BY CHOSEN ACCREDITATION VERSION
   useEffect(() => {
      const fetchAndFilterPLOs = async () => {
         await getPLOs(); // Ensure PLOs are fetched first
         handleFilterPLOs(); // Then filter them
         console.log("Filtered PLOs: ", PLOs);
      };
      
      fetchAndFilterPLOs();
   }, [courseInfo.accreditationVersion]);
   // STOP  - FILTERS PLOs BY CHOSEN ACCREDITATION VERSION
   
   // START - ON MOUNT FUNCTION CALLS (FOR DATA FETCHING)
   useEffect(() => {
      const fetchData = async () => {
         await getPrograms();
         await getAccreditationOrganizations();
         await getAccreditationVersions(); 
         await getPLOs();
         await getInstructor();
      };
      
      fetchData();
   }, []);
   // STOP  - ON MOUNT FUNCTION CALLS (FOR DATA FETCHING)
   
   
   // HTML Stuff
   return (
      <div className="flex flex-col items-center justify-start w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%] gap-y-8">
         <div className="p-10 bg-white rounded-md">
         <Box sx={{ maxWidth: 600, margin: "auto" }}>
            <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 3 }}>
               Add New Course
            </Typography>
            
            {/* Step 1: Basic Course Information */}
            {currentStep === 1 && (
            <Box>
               {/* Program Dropdown */}
               <FormControl fullWidth margin="normal">
                  <InputLabel>Program</InputLabel>
                  <Select
                     label="Program"
                     name="program"
                     value={courseInfo.program}
                     onChange={handleCourseInfoChange}
                     sx={{ textAlign: 'left' }}  // Align selected value to the left
                  >
                     {programs.map((program) => (
                        <MenuItem key={program.program_id} value={program.program_id}>
                           {program.designation}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               
               {/* Accreditation Organization Dropdown */}
               <FormControl fullWidth margin="normal">
                  <InputLabel>Accreditation Organization</InputLabel>
                  <Select
                     value={selectedAccreditationOrg || ''}
                     onChange={handleAccreditationOrgChange}
                     label="Accreditation Organization"
                     sx={{ textAlign: 'left' }}  // Align selected value to the left
                  >
                     {accreditationOrganizations.map((org) => (
                        <MenuItem key={org.a_organization_id} value={org.a_organization_id}>
                           {org.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               
               {/* Accreditation Version Dropdown */}
               <FormControl fullWidth margin="normal" disabled={!courseInfo.accreditationOrganization}>
                  <InputLabel>Accreditation Version</InputLabel>
                  <Select
                     label="Accreditation Version"
                     name="accreditationVersion"
                     value={courseInfo.accreditationVersion}
                     onChange={handleCourseInfoChange}
                     sx={{ textAlign: 'left' }}  // Align selected value to the left
                  >
                     {accreditationVersions
                        .filter(version => version.a_organization.a_organization_id === courseInfo.accreditationOrganization) // Filter by organization
                        .map((version) => (
                           <MenuItem key={version.a_version_id} value={version.a_version_id}>
                              {version.year} {/* Display year and version ID */}
                           </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               
               {/* Other fields */}
               <TextField
                  fullWidth
                  label="Course Number"
                  name="courseNumber"
                  value={courseInfo.courseNumber}
                  onChange={handleCourseInfoChange}
                  margin="normal"
                  type="number"  // Ensures only numbers can be entered
                  slotProps={{
                     input: {
                        min: 0,  // Prevents negative numbers (optional)
                        max: 999,  // Prevents too big of integers being inputted
                     },
                  }}
               />
               <TextField
                  fullWidth
                  label="Course Name"
                  name="courseName"
                  value={courseInfo.courseName}
                  onChange={handleCourseInfoChange}
                  margin="normal"
               />
               <TextField
                  fullWidth
                  label="Description (Optional)"
                  name="description"
                  value={courseInfo.description}
                  onChange={handleCourseInfoChange}
                  margin="normal"
               />
            </Box>
            )}
            
            {/* Step 2: Course Learning Objectives */}
            {currentStep === 2 && (
            <Box>
               <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Add Course Learning Objectives (CLOs)
               </Typography>
               
               {cloList.map((clo, index) => (
                  <div className="flex flex-col bg-gray-100 rounded-lg pl-4 pr-4 mb-4">
                     <Box key={index} sx={{ marginBottom: 2 }}>
                        <TextField
                           fullWidth
                           label="CLO Designation (1-20)"
                           type="number"
                           value={clo.designation}
                           onChange={(e) => handleCloChange(index, "designation", e.target.value)}
                           error={clo.designation && (clo.designation < 1 || clo.designation > 20 || cloList.some((otherClo, idx) => otherClo.designation === clo.designation && idx !== index))}
                           helperText={clo.designation && (clo.designation < 1 || clo.designation > 20) ? "Designation must be between 1 and 20" : ""}
                           margin="normal"
                        />
                        <TextField
                           fullWidth
                           label="Description"
                           value={clo.description}
                           onChange={(e) => handleCloChange(index, "description", e.target.value)}
                           required
                           margin="normal"
                        />
                     </Box>
                  </div>
               ))}
               
               {/* Disabled Add Another CLO button */}
               <Button
                  variant="outlined"
                  onClick={handleAddClo}
                  sx={{ marginTop: 4, marginBottom: 2 }}
                  disabled={isAddCloDisabled} // Disable button if last CLO is not filled out correctly
               >
                  Add Another CLO
               </Button>
            </Box>
            )}
            
            {/* Step 3: CLO <-> PLO Mappings */}
            {currentStep === 3 && (
               <Box>
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>Map CLOs to PLOs</Typography>
                  
                  {cloList.map((clo, cloIndex) => {
                        console.log("ploMappings structure:", ploMappings);
                        
                        // Find the CLO to PLO mappings for the current CLO
                        const mappedPLOs = ploMappings
                           .filter(mapping => mapping.cloDesignation === clo.designation)
                           .map(mapping => mapping.plo);
                        
                        // Find available PLOs that are not yet mapped
                        const availablePLOs = PLOs.filter(plo => !mappedPLOs.includes(plo.plo_id));
                        console.log("Available PLOs: ", availablePLOs);
                        
                        return (
                           <Box key={cloIndex} sx={{ marginBottom: 3, padding: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                              <Typography variant="body1">CLO {clo.designation}: {clo.description}</Typography>
                              
                              {/* PLO Dropdown */}
                              <FormControl fullWidth margin="normal">
                                    <InputLabel>Select PLO</InputLabel>
                                    <Select
                                       value=""
                                       onChange={(e) => handlePloMappingChange(clo.designation, e.target.value)}
                                    >
                                       {availablePLOs.map((plo) => (
                                          <MenuItem key={plo.plo_id} value={plo.plo_id}>
                                                {plo.designation}: {plo.description}
                                          </MenuItem>
                                       ))}
                                    </Select>
                              </FormControl>
                              
                              {/* Display Mapped PLOs */}
                              {mappedPLOs.length > 0 && (
                                    <Box>
                                       {mappedPLOs.map((ploId) => (
                                          <Box key={ploId} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 1 }}>
                                                <Typography variant="body2">PLO: {PLOs.find(p => p.plo_id === ploId)?.designation} {PLOs.find(p => p.plo_id === ploId)?.description}</Typography>
                                                <IconButton size="small" onClick={() => handleRemovePloMapping(clo.designation, ploId)}>
                                                   ❌
                                                </IconButton>
                                          </Box>
                                       ))}
                                    </Box>
                              )}
                           </Box>
                        );
                  })}
               </Box>
            )}
            
            
            {/* Navigation Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            {currentStep === 1 && (
               <Link to="/courses">
                  <Button variant="outlined" color="error">
                  Cancel
                  </Button>
               </Link>
            )}
            
            {currentStep > 1 && (
               <IconButton onClick={handlePrev} color="primary">
                  <ArrowBack />
               </IconButton>
            )}
            
            {currentStep < 3 && (
               <IconButton
                  onClick={handleNext}
                  color="primary"
                  disabled={
                  (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)
                  }
               >
                  <ArrowForward />
               </IconButton>
            )}
            
            {currentStep === 3 && (
               <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDone}
                  disabled={cloList.length === 0}
               >
                  Done
               </Button>
            )}
            </Box>
         </Box>
         </div>
      </div>
   );
};

export default AddNewCourseManual;
