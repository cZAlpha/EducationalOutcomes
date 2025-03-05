import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, IconButton, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { ArrowForward, ArrowBack } from "@mui/icons-material";
import api from '../api';
import { Link } from 'react-router-dom'; // Import Link if using react-router


const AddNewCourseManual = () => {
   // START - Variables to hold data
   const [programs, setPrograms] = useState([]);
   const [accreditationOrganizations, setAccreditationOrganizations] = useState([]);
   const [selectedAccreditationOrg, setSelectedAccreditationOrg] = useState(null); // Selected a_org
   const [accreditationVersions, setAccreditationVersions] = useState([]);
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
      setCloList([...cloList, { designation: "", description: "" }]);
   };
   
   const handlePloMappingChange = (cloDesignation, plo) => {
      setPloMappings((prevMappings) => [...prevMappings, { cloDesignation, plo }]);
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
   
   const handleDone = () => {
      alert("Course and CLO Mapping Added Successfully!");
      // Here you can submit the data to the server.
   };
   
   // START - ON MOUNT FUNCTION CALLS (FOR DATA FETCHING)
   useEffect(() => {
      getPrograms();
      getAccreditationOrganizations();
      getAccreditationVersions(); 
   }, []);
   // STOP  - ON MOUNT FUNCTION CALLS (FOR DATA FETCHING)
   
   // TESTING
   useEffect(() => {
      console.log("Course Info: ", courseInfo);
      console.log("CLO List: ", cloList);
      console.log("PLO Mappings List: ", ploMappings);
   }, [courseInfo, cloList]);
   
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
                  <div className="flex flex-col bg-gray-200 rounded-lg pl-4 pr-4 mb-4">
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
            
            {/* Step 3: Mapping CLOs to PLOs */}
            {currentStep === 3 && (
            <Box>
               <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Map CLOs to PLOs
               </Typography>
               
               {cloList.length === 0 ? (
                  <Typography variant="body1" sx={{ color: "red", marginBottom: 2 }}>
                  Please add at least one CLO before proceeding.
                  </Typography>
               ) : (
                  cloList.map((clo, index) => (
                  <Box key={index} sx={{ marginBottom: 2 }}>
                     <Typography variant="body1">CLO {clo.designation}: {clo.description}</Typography>
                     <TextField
                        fullWidth
                        label="PLO Mapping"
                        onChange={(e) => handlePloMappingChange(clo.designation, e.target.value)}
                        margin="normal"
                     />
                  </Box>
                  ))
               )}
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
