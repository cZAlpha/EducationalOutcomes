import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, DialogContentText, Autocomplete, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import api from "../api";
import LoadingIndicator from "../components/LoadingIndicator";
import PdfViewer from "../components/ToolsPage/PDFViewer";


function Tools() {
   // START - State Vars for Modals
   const [showProgramPerformanceReportForm, setShowProgramPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Program performance report form
   const [showCoursePerformanceReportForm, setShowCoursePerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Course performance report form
   const [showSectionPerformanceReportForm, setShowSectionPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Section performance report form
   const [isLoading, setIsLoading] = useState(false); // Add loading state
   const [isDownloading, setIsDownloading] = useState(false); // Another loading state to make a loading throbber appear on the download button for better UX feel
   // STOP  - State Vars for Modals
   
   // START - Program Variables
      // Program Course Mapping Variable
   const [programCourseMappings, setProgramCourseMappings] = useState([]); // Array to hold all the program course mappings grabbed from the backend
   const [programs, setPrograms] = useState([]); // Array to hold programs grabbed from the backend
   const [selectedProgram, setSelectedProgram] = useState(null) // The selected program by the user
   const [programPerformanceData, setProgramPerformanceData] = useState(null); // Object used to store the performance data for a program (PDF)
   const [showProgramPerformancePdfViewer, setShowProgramPerformancePdfViewer] = useState(false); // Variable that dictates whether the program performance's pdf viewer should be shown or not
      // Program Semester Vars
   const [programSemesters, setProgramSemesters] = useState([]); // Array to hold the semesters that the user's selected program spans
   const [selectedProgramSemesters, setSelectedProgramSemesters] = useState([]); // This use state is used to store all semesters that the user selected to whitelist filter the program performance data from
   // STOP  - Program Variables
   
   // START - Courses Variables
   const [courses, setCourses] = useState([]); // Courses
   const [selectedCourse, setSelectedCourse] = useState(null); // Selected Course (from course performance report form)
   const [coursePerformanceData, setCoursePerformanceData] = useState(null); // Object used to store the performance data gathered for the selectedCourse
   const [showCoursePerformancePdfViewer, setShowCoursePerformancePdfViewer] = useState(false); // A state var used to track whether the course performance pdf viewer should be shown
      // Courses Semester Vars
   const [courseSemesters, setCourseSemesters] = useState([]); // Semesters that correspond to the user's currently selectedCourse (NOT sent to the backend, this is just for the user to see and select)
   const [selectedCourseSemesters, setSelectedCourseSemesters] = useState([]); // This use state is used to store all the semesters that the user selected to whitelist filter (this is the thing sent to the backend to filter it there)
   // STOP - Courses Variables
   
   // START - Sections Variable(s)
   const [sections, setSections] = useState([]); // Sections fetched from the backend are stored here
   const [selectedSection, setSelectedSection] = useState([]); // The section that the user selects for a section performance report, will be sent to the backend (should be the ID [pk] of the selected section rather than the obj itself)
   const [sectionPerformanceData, setSectionPerformanceData] = useState(null); // Section performance data grabbed from the backend
   const [showSectionPerformancePdfViewer, setShowSectionPerformancePdfViewer] = useState(false); // A state var used to track whether the section performance pdf viewer should be shown
   const [filteredSections, setFilteredSections] = useState([]); // Filtered sections that are shown to the user in the Course Performance Report Form, filtered by 'courseSemesters' value (sections that are from the 'selectedCourse' var are stored in this var)
   const [excludedSections, setExcludedSections] = useState([]); // Excluded sections (sections that were selected to be discluded from the Course Performance Report generation, this will be directly sent to the backend!)
   // STOP  - Sections Variable(s)
   
   // START - Semester Vars
   const [semesters, setSemesters] = useState([]); // Semester (used to filter out sections and other objects related to time that are used to filter out things for the reports)
   // STOP  - Semester Vars
   
   // START - Program-Course Mappings Data Fetching
   const getProgramCourseMappings = async () => {
      api
         .get('/api/program-course-mappings/')
         .then((res) => setProgramCourseMappings(res.data))
         .catch((err) => alert(`Error fetching program course mappings: ${err.message}`));
   };
   // STOP  - Program-Course Mappings Data Fetching
   
   // START - Program Data Fetching
   const getPrograms = async () => {
      api
         .get('/api/programs/')
         .then((res) => setPrograms(res.data))
         .catch((err) => alert(`Error fetching programs: ${err.message}`));
   };
   // STOP  - Program Data Fetching
   
   // START - Course Data Fetching
   const getCourses = async () => {
      api
         .get('/api/courses/')
         .then((res) => setCourses(res.data))
         .catch((err) => alert(`Error fetching courses: ${err.message}`));
   };
   // STOP  - Course Data Fetching 
   
   // START - Sections Fetching
   const getSections = async () => {
      try {
         const res = await api.get('/api/sections/');
         setSections(res.data); 
      } catch (err) {
         alert(`Error fetching Sections: ${err.message}`);
      }
   };
   // STOP  - Sections Fetching
   
   // START - Semester Data Fetching
   const getSemesters = async () => {
      try {
         const res = await api.get('/api/semesters/');
         setSemesters(res.data);
      } catch (err) {
         alert(`Error fetching Semesters: ${err.message}`);
      }
   };
   // STOP  - Semester Data Fetching
   
   // START - Handle Section Toggle (allows for exclusion of certain sections from a Course Performance Report)
   const handleSectionToggle = (event, sectionId) => {
      if (event.target.checked) {
         // Add to excludedSections if it's checked
         setExcludedSections(prevExcludedSections => 
            prevExcludedSections.filter(id => id !== sectionId)
         );
      } else {
         // Prevent unchecking if it's the last section remaining
         if (excludedSections.length === filteredSections.length - 1) {
            alert("You must have at least one section selected!");
            return;
         }
         
         // Otherwise, remove sectionId from excludedSections
         setExcludedSections(prevExcludedSections => 
            [...prevExcludedSections, sectionId]
         );
      }
   };
   // STOP - Handle Section Toggle
   
   // START - Filter Program Semesters
   const filterProgramSemesters = (selectedProgramId) => {
      // NOTE: This function will filter semesters based on the user's selected program within the program performance report form
      if (selectedProgramId && semesters) {
         if (semesters.length === 0) { // Gracefully catch length error
            console.log("Tools.jsx | filterCourseSemesters | No semesters to filter");
         } else {
            console.log("filterProgramSemesters | All Semesters: ", semesters);
            // Iterate over all program-course mappings and store all courses that are a part of the given program
            let programCourses = [];
            programCourseMappings.forEach((programCourseMapping) => {
               if (programCourseMapping.program == selectedProgramId) {  // If the current mapping is part of the selectedProgram, add the course to the 'programCourses' array
                  programCourses.push(programCourseMapping.course); // Add the course to the list
               }
            });
            console.log("filterProgramSemesters | programCourses: ", programCourses);
            
            // Iterate over all the sections and find all sections that are a part of a course from the 'programCourses' array
            let programSections = [];
            sections.forEach((section) => {
               if (programCourses.includes(section.course)) { // If the given section is a part of a course that is a part of selected program
                  programSections.push(section); // Add that section to the 'programSections' array
               }
            });
            
            // Extract unique semesters from program sections
            let filteredSemesters = [];
            programSections.forEach(programSection => {
               const semester = programSection.semester_details;
               if (!filteredSemesters.some(s => s.designation === semester.designation)) {
                  filteredSemesters.push(semester);
               }
            });
            
            console.log("filterCourseSemesters | Filtered Semesters: ", filteredSemesters);
            setProgramSemesters(filteredSemesters);
         }
      }
   };
   // STOP  - Filter Program Semesters
   
   // START - Course Semester Filtering 
   function filterCourseSemesters(selectedCourseId, _filteredSections) {
      if (selectedCourseId && semesters && _filteredSections) {
         if (semesters.length === 0) { // Gracefully catch length error
            console.log("Tools.jsx | filterCourseSemesters | No semesters to filter");
         } else if  (_filteredSections.length === 0) {
            console.log("Tools.jsx | filterCourseSemesters | No sections to filter with");
         } else {
            console.log("filterCourseSemesters | All Semesters: ", semesters);
            console.log("filterCourseSemesters | Filtered Sections: ", _filteredSections);
            // Filter semesters based on whether any filteredSection belongs to that semester
            let filteredSemesters = [];
            _filteredSections.forEach(section => {
               // Check if the designation already exists in the filteredSemesters array
               if (!filteredSemesters.some(semester => semester.designation === section.semester_details.designation)) {
                  filteredSemesters.push(section.semester_details);
               }
            });
            console.log("filterCourseSemesters | Filtered Semesters: ", filteredSemesters);
            setCourseSemesters(filteredSemesters);
         }
      }
   }
   // STOP  - Course Semester Filtering 
   
   // START - Filter Sections
   function filterSections(selectedCourseId) {
      // NOTE: This functions will filter sections based on the user's selected course in the course performance report form.
      let filteredSections = sections.filter(section => section.course_details.course_id === selectedCourseId)
      setFilteredSections(filteredSections);
      filterCourseSemesters(selectedCourseId, filteredSections);
   }; 
   // STOP  - Filter Sections
   
   // START - Program Performance Data Fetching 
   const getProgramPerformance = async () => {
      if (selectedProgram) {
         setIsLoading(true); // Set loading to be true because it is loading
         try {
               // Construct query params
            const params = new URLSearchParams();
               // Append selectedProgramSemesters as an array of objects
            selectedProgramSemesters.forEach((semester) => {
                  params.append("selectedProgramSemesters", JSON.stringify(semester));
            });
               // Call the backend
            const res = await api.get(`/api/programs/${selectedProgram}/performancereport?${params.toString()}`, {
                  responseType: "arraybuffer", // Important: Get the response as arraybuffer
            });
               // Set the section data from the backend fetch
            setProgramPerformanceData(res.data);
         } catch (err) {
            alert(`Error fetching program performance data: ${err.message}`);
         } finally {
            setIsLoading(false); // After all is said and done, set loading to false
         }
      } else {
         alert("Error fetching program performance data due to no section being selected!");
      }
   };
   // STOP  - Program Performance Data Fetching
   
   // START - Course Performance Data Fetching 
   const getCoursePerformance = async () => {
      if (selectedCourse) {
         setIsLoading(true);
         
         try {
               // Construct query params
            const params = new URLSearchParams();
               // Append selectedCourseSemesters as an array of objects
            selectedCourseSemesters.forEach((semester) => {
                  params.append("selectedCourseSemesters", JSON.stringify(semester));
            });
               // Append excludedSection IDs
            excludedSections.forEach((sectionId) => {
                  params.append("excludedSection", sectionId);
            });
               // Call the backend
            const res = await api.get(`/api/courses/${selectedCourse}/performancereport?${params.toString()}`, {
                  responseType: "arraybuffer", // Important: Get the response as arraybuffer
            });
               // Set the course data from the backend fetch
            setCoursePerformanceData(res.data);
         } catch (err) {
            alert(`Error fetching course performance data: ${err.message}`);
         } finally {
            setIsLoading(false);
         }
      } else {
         alert("Error fetching course performance data due to no course being selected!");
      }
   };
   // STOP  - Course Performance Data Fetching
   
   // START - Section Performance Data Fetching 
   const getSectionPerformance = async () => {
      if (selectedSection) {
         setIsLoading(true); // Set loading to be true because it is loading
         try {
            // Call the backend
            const res = await api.get(`/api/sections/${selectedSection}/performancereport`, {
                  responseType: "arraybuffer", // Important: Get the response as arraybuffer
            });
               // Set the section data from the backend fetch
            setSectionPerformanceData(res.data);
         } catch (err) {
            alert(`Error fetching section performance data: ${err.message}`);
         } finally {
            setIsLoading(false); // After all is said and done, set loading to false
         }
      } else {
         alert("Error fetching section performance data due to no section being selected!");
      }
   };
   // STOP  - Section Performance Data Fetching
   
   // START - Submit Course Performance Data
   const handleSubmit = async () => {
      // NOTE: If you're wondering why the loading variable is not being swapped here, its handled in the performance functions on 
      // all levels of granularity. This was a purposeful design choice, but it doesn't matter really where you handle them.
      if (selectedProgram) {
         await getProgramPerformance(); // Await the finishing of the grabbing of performance data
         setShowProgramPerformancePdfViewer(true); // Switch to PDF viewer after data is loaded
      } else if (selectedCourse) {
         await getCoursePerformance(); // Await the finishing of the grabbing of performance data
         setShowCoursePerformancePdfViewer(true); // Switch to PDF viewer after data is loaded
      } else if (selectedSection) {
         await getSectionPerformance(); // Await the finishing of the grabbing of performance data
         setShowSectionPerformancePdfViewer(true); // Switch to PDF viewer after data is loaded
      } else {
         // Handle the case where no course is selected
         console.log("Tools.jsx | handleSubmit | No program, course, or section is selected. This is probably due to an error in the programming rather than user error.");
         // Maybe display an error message to the user?
      }
   };
   // STOP  - Submit Course Performance Data
   
   // START - Handle Download Throbber State
   function handleDownloading() {
      setIsDownloading(true);
      setTimeout(() => { setIsDownloading(false); }, 1000); // Wait 1 second before setting isDownloading to false to simulate the download taking that long, otherwise instant loading would seem kinda jarring
   }
   // STOP  - Handle Download Throbber State
   
   // ON MOUNT FUNCTION CALLS
   useEffect(() => { // On component mount, call all functions within this 
      const fetchData = async () => {
         await getProgramCourseMappings();
         await getPrograms();
         await getCourses();
         await getSemesters();
         await getSections();
      };
      
      fetchData();
   }, []);
   
   // TESTING ONLY
   useEffect(() => {
      console.log("Selected Program Semester(s): ", selectedProgramSemesters);
   }, [selectedProgramSemesters]);
   
   return (
      <div className="flex flex-col gap-y-10 items-center h-screen mt-12 justify-start"> {/* Main Container */}
         {/* Header */}
         <div className="w-full flex flex-col items-center gap-y-4">
            <h1 className="font-bold text-4xl text-white">Tools</h1>
         </div>
         
         {/* Container */}
         <div 
            className={`flex flex-col justify-center space-y-6 w-[90vw] md:w-[60vw] bg-[#ffffffb3] rounded-md px-8 py-8 mx-auto transition-opacity duration-300 ${
               showCoursePerformanceReportForm || showSectionPerformanceReportForm || showProgramPerformanceReportForm ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
         >
            {/* Program Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Program Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take into account all PLOs a given program has and display the performance of each PLO, along with giving some performance characteristics of the courses therein.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowProgramPerformanceReportForm(true)}
                  disabled={showProgramPerformanceReportForm || showCoursePerformanceReportForm || showSectionPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Course Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Course Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given course.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowCoursePerformanceReportForm(true)}
                  disabled={showProgramPerformanceReportForm || showCoursePerformanceReportForm || showSectionPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Section Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Section Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given section.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowSectionPerformanceReportForm(true)}
                  disabled={showProgramPerformanceReportForm || showCoursePerformanceReportForm || showSectionPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
         </div>
         
         {/* Program Performance Report Modal*/}
         <Dialog open={showProgramPerformanceReportForm} maxWidth="md" fullWidth>
            {!isLoading && !showProgramPerformancePdfViewer && (
               <>
                  <DialogTitle>Program Performance Report</DialogTitle>
                  <DialogContent>
                     <p>Choose a Program to generate a report for</p>
                     <Autocomplete
                        fullWidth
                        options={programs}
                        getOptionLabel={(option) => (option.designation)} 
                        renderInput={(params) => <TextField {...params} label="Programs" variant="outlined" margin="normal" />}
                        onChange={(event, newValue) => {
                           const newProgramId = newValue?.program_id;
                           setSelectedProgram(newProgramId);
                           setSelectedProgramSemesters([]); 
                           filterProgramSemesters(newProgramId);
                        }}
                     />
                     {/* User is only allowed to select a semester to filter for only after they've chosen a program */}
                     {selectedProgram && 
                        <div className="mt-4">
                           <p>Select semester(s) to generate the report from (optional)</p>
                           <Autocomplete
                              multiple
                              fullWidth
                              options={programSemesters}
                              value={selectedProgramSemesters}
                              getOptionLabel={(option) => String(option.designation)} // Ensure it's a string
                              renderInput={(params) => <TextField {...params} label="Semester Designation" variant="outlined" margin="normal" />}
                              onChange={(event, newValue) => setSelectedProgramSemesters(newValue)}
                           />
                        </div>
                     }
                  </DialogContent>
                  <DialogActions>
                     <Button 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                        }}
                        type="submit" 
                        color="primary" 
                        variant="contained" 
                        onClick={() => {
                           handleSubmit(); // This calls the function to get the performance from the backend
                           setSelectedProgram(null);
                        }}
                     >
                     Submit
                     </Button>
                     <Button 
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
                        color="error" 
                        variant="outlined" 
                        onClick={() => {
                           setShowProgramPerformanceReportForm(false);
                           setSelectedProgram(null);
                        }}
                     >
                     Cancel
                     </Button>
                  </DialogActions>
               </>
            )}
            
            {isLoading && (
               <>
                  <DialogTitle>Fetching Performance Information...</DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                     <LoadingIndicator />
                  </div>
               </>
            )}
            
            {!isLoading && showProgramPerformancePdfViewer && (
               <>
                  {/* Title */}
                  <DialogTitle>Program Performance Report</DialogTitle>
                  {/* Content */}
                  <DialogContent style={{height: '90vh', overflowY: 'auto'}}>
                        {/* Create Blob and display size if ArrayBuffer exists */}
                        {programPerformanceData instanceof ArrayBuffer && (
                              <>
                                 <div className="mb-6"> {/* Contains the filename and filesize */}
                                    <p>
                                       <span className="font-semibold">Filename:</span> <span>Program_Performance_Report.pdf</span>
                                    </p>
                                    
                                    {/* Create a blob from the array buffer to get the size. */}
                                    {/* Calculate file size in KB or MB */}
                                    {(() => {
                                       const fileSizeInBytes = new Blob([sectionPerformanceData], { type: 'application/pdf' }).size;
                                       if (fileSizeInBytes < 1024 * 1024) {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / 1024).toFixed(2)} KB</p>;
                                       } else {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB</p>;
                                       }
                                    })()}
                                 </div>
                                 <PdfViewer pdfData={programPerformanceData} />
                              </>
                        )}
                  </DialogContent>
                  
                  {/* Dialog Buttons */}
                  <DialogActions>
                        {/* Download Button */}
                        <Button color="primary" variant="contained" 
                           sx={{
                              minWidth: '40px',
                              minHeight: '50px',
                              backgroundColor: isDownloading ? 'grey' : '', // Set background color to grey if downloading
                              '&:hover': {
                                 backgroundColor: isDownloading ? 'grey' : '', // Ensure hover stays the same when downloading
                              },
                           }}
                           disabled={!programPerformanceData}
                           onClick={() => {
                              handleDownloading();
                              if (programPerformanceData) { // Check if sectionPerformanceData exists
                                 try {
                                       const blob = new Blob([programPerformanceData], { type: 'application/pdf' });
                                       const url = URL.createObjectURL(blob);
                                       const link = document.createElement('a');
                                       link.href = url;
                                       link.setAttribute('download', 'Program_Performance_Report.pdf'); // This is where the filename is set
                                       document.body.appendChild(link);
                                       link.click();
                                       link.remove();
                                 } catch (error) {
                                       console.error("Error creating or downloading PDF:", error);
                                 }
                              } else {
                                 console.error("programPerformanceData is undefined or null.");
                              }
                           }
                        }>
                           {isDownloading ?
                                 <LoadingIndicator size="md" />
                              :
                                 `Download PDF` 
                           }
                           
                        </Button>
                        {/* Cancel Button */}
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
                           onClick={() => {
                              setShowProgramPerformanceReportForm(false);
                              setShowProgramPerformancePdfViewer(false);
                           }
                        }>
                           Close
                        </Button>
                  </DialogActions>
               </>
            )}
         </Dialog>
         
         {/* Course Performance Report Modal*/}
         <Dialog open={showCoursePerformanceReportForm} maxWidth="md" fullWidth>
            {!isLoading && !showCoursePerformancePdfViewer && (
               <>
                  <DialogTitle>Course Performance Report</DialogTitle>
                  <DialogContent>
                     <p>Choose a Course to generate a report for</p>
                     <Autocomplete
                        fullWidth
                        options={courses}
                        getOptionLabel={(option) => option.name} 
                        renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" margin="normal" />}
                        onChange={(event, newValue) => {
                           setSelectedCourse(newValue?.course_id);
                           setSelectedCourseSemesters([]);
                           filterSections(newValue?.course_id);
                           // FilterCourseSemesters is called within 'filterSections'! 
                        }}
                     />
                     {/* User is only allowed to select a semester to filter for only after they've chosen a course to filter for */}
                     {selectedCourse && 
                        <div className="mt-4">
                           <p>Select semester(s) to generate the report from (optional)</p>
                           <Autocomplete
                              multiple
                              fullWidth
                              options={courseSemesters}
                              value={selectedCourseSemesters}
                              getOptionLabel={(option) => String(option.designation)} // Ensure it's a string
                              renderInput={(params) => <TextField {...params} label="Semester Designation" variant="outlined" margin="normal" />}
                              onChange={(event, newValue) => setSelectedCourseSemesters(newValue)}
                           />
                        </div>
                     }
                     {/* User is only allowed to select a section (or set of sections) once they've selected a course and semester (or set of semesters) */}
                     {(selectedCourseSemesters && (selectedCourseSemesters.length > 0)) && (
                        <div className="mt-4">
                           <p>By default, all sections of the selected semesters will be included. You may optionally choose to disclude any listed sections from your report.</p>
                           
                           <div className="mt-2">
                              <FormGroup>
                                 {/* Group sections by their semester */}
                                 {selectedCourseSemesters.map((semester) => {
                                    // Filter sections belonging to the current semester
                                    const sectionsInSemester = filteredSections.filter(
                                       (section) => section.semester_details.designation === semester.designation
                                    );
                                    
                                    if (sectionsInSemester.length === 0) return null; // Skip if no sections for the semester
                                    
                                    return (
                                       <div key={semester.semester_id}>
                                          {/* Display the semester name at the top */}
                                          <h3 className="text-xl">{semester.designation}</h3>
                                          {sectionsInSemester.map((section) => (
                                             <FormControlLabel
                                                key={section.section_id}
                                                control={
                                                   <Checkbox
                                                      checked={!excludedSections.includes(section.section_id)} // Checkboxes will be checked if the section is not in the excluded list
                                                      onChange={(event) => handleSectionToggle(event, section.section_id)}
                                                      name={section.section_id.toString()} // Ensure each checkbox has a unique name
                                                   />
                                                }
                                                label={`${section.course_details.name} | Section ${section.section_number} | Instructor: ${section.instructor_details.last_name}`} 
                                                sx={{
                                                   display: "flex",
                                                }}
                                             />
                                          ))}
                                       </div>
                                    );
                                 })}
                              </FormGroup>
                           </div>
                        </div>
                     )}
                  </DialogContent>
                  <DialogActions>
                     <Button 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                        }}
                        type="submit" 
                        color="primary" 
                        variant="contained" 
                        onClick={() => {
                           handleSubmit();
                           setSelectedCourse(null);
                           setSelectedCourseSemesters([]);
                           setExcludedSections([]);
                        }}
                     >
                     Submit
                     </Button>
                     <Button 
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
                        color="error" 
                        variant="outlined" 
                        onClick={() => {
                           setShowCoursePerformanceReportForm(false);
                           setSelectedCourse(null);
                           setSelectedCourseSemesters([]);
                           setExcludedSections([]);
                        }}
                     >
                     Cancel
                     </Button>
                  </DialogActions>
               </>
            )}
            
            {isLoading && (
               <>
                  <DialogTitle>Fetching Performance Information...</DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                     <LoadingIndicator />
                  </div>
               </>
            )}
            
            {!isLoading && showCoursePerformancePdfViewer && (
               <>
                  {/* Title */}
                  <DialogTitle>Course Performance Report</DialogTitle>
                  {/* Content */}
                  <DialogContent style={{height: '90vh', overflowY: 'auto'}}>
                        {/* Create Blob and display size if ArrayBuffer exists */}
                        {coursePerformanceData instanceof ArrayBuffer && (
                              <>
                                 <div className="mb-6"> {/* Contains the filename and filesize */}
                                    <p>
                                       <span className="font-semibold">Filename:</span> <span>Course_Performance_Report.pdf</span>
                                    </p>
                                    
                                    {/* Create a blob from the array buffer to get the size. */}
                                    {/* Calculate file size in KB or MB */}
                                    {(() => {
                                       const fileSizeInBytes = new Blob([coursePerformanceData], { type: 'application/pdf' }).size;
                                       if (fileSizeInBytes < 1024 * 1024) {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / 1024).toFixed(2)} KB</p>;
                                       } else {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB</p>;
                                       }
                                    })()}
                                 </div>
                                 <PdfViewer pdfData={coursePerformanceData} />
                              </>
                        )}
                  </DialogContent>
                  
                  {/* Dialog Buttons */}
                  <DialogActions>
                        {/* Download Button */}
                        <Button color="primary" variant="contained" 
                           sx={{
                              minWidth: '40px',
                              minHeight: '50px',
                              backgroundColor: isDownloading ? 'grey' : '', // Set background color to grey if downloading
                              '&:hover': {
                                 backgroundColor: isDownloading ? 'grey' : '', // Ensure hover stays the same when downloading
                              },
                           }}
                           onClick={() => {
                              handleDownloading();
                              if (coursePerformanceData) { // Check if coursePerformanceData exists
                                 try {
                                       const blob = new Blob([coursePerformanceData], { type: 'application/pdf' });
                                       const url = URL.createObjectURL(blob);
                                       const link = document.createElement('a');
                                       link.href = url;
                                       link.setAttribute('download', 'Course_Performance_Report.pdf');
                                       document.body.appendChild(link);
                                       link.click();
                                       link.remove();
                                 } catch (error) {
                                       console.error("Error creating or downloading PDF:", error);
                                 }
                              } else {
                                 console.error("coursePerformanceData is undefined or null.");
                              }
                           }
                        }>
                           {isDownloading ?
                                 <LoadingIndicator size="md" />
                              :
                                 `Download PDF` 
                           }
                           
                        </Button>
                        {/* Cancel Button */}
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
                           onClick={() => {
                              setShowCoursePerformanceReportForm(false);
                              setShowCoursePerformancePdfViewer(false);
                           }
                        }>
                           Close
                        </Button>
                  </DialogActions>
               </>
            )}
         </Dialog>
         
         {/* Section Performance Report Modal*/}
         <Dialog open={showSectionPerformanceReportForm} maxWidth="md" fullWidth>
            {!isLoading && !showSectionPerformancePdfViewer && (
               <>
                  <DialogTitle>Section Performance Report</DialogTitle>
                  <DialogContent>
                     <p>Choose a Section to generate a report for</p>
                     <Autocomplete
                        fullWidth
                        options={sections}
                        getOptionLabel={(option) => (option.course_details.name + " " + option.section_number + " | (" + option.crn + ")" + " | " + option.semester_details.designation)} 
                        renderInput={(params) => <TextField {...params} label="Sections" variant="outlined" margin="normal" />}
                        onChange={(event, newValue) => {
                           setSelectedSection(newValue?.section_id);
                        }}
                     />
                  </DialogContent>
                  <DialogActions>
                     <Button 
                        sx={{
                           minWidth: '40px',
                           minHeight: '50px',
                        }}
                        type="submit" 
                        color="primary" 
                        variant="contained" 
                        onClick={() => {
                           handleSubmit(); // This calls the function to get the performance from the backend
                           setSelectedSection(null);
                        }}
                     >
                     Submit
                     </Button>
                     <Button 
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
                        color="error" 
                        variant="outlined" 
                        onClick={() => {
                           setShowSectionPerformanceReportForm(false);
                           setSelectedSection(null);
                        }}
                     >
                     Cancel
                     </Button>
                  </DialogActions>
               </>
            )}
            
            {isLoading && (
               <>
                  <DialogTitle>Fetching Performance Information...</DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                     <LoadingIndicator />
                  </div>
               </>
            )}
            
            {!isLoading && showSectionPerformancePdfViewer && (
               <>
                  {/* Title */}
                  <DialogTitle>Section Performance Report</DialogTitle>
                  {/* Content */}
                  <DialogContent style={{height: '90vh', overflowY: 'auto'}}>
                        {/* Create Blob and display size if ArrayBuffer exists */}
                        {sectionPerformanceData instanceof ArrayBuffer && (
                              <>
                                 <div className="mb-6"> {/* Contains the filename and filesize */}
                                    <p>
                                       <span className="font-semibold">Filename:</span> <span>Section_Performance_Report.pdf</span>
                                    </p>
                                    
                                    {/* Create a blob from the array buffer to get the size. */}
                                    {/* Calculate file size in KB or MB */}
                                    {(() => {
                                       const fileSizeInBytes = new Blob([sectionPerformanceData], { type: 'application/pdf' }).size;
                                       if (fileSizeInBytes < 1024 * 1024) {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / 1024).toFixed(2)} KB</p>;
                                       } else {
                                          return <p><span className="font-semibold">Size:</span> {(fileSizeInBytes / (1024 * 1024)).toFixed(2)} MB</p>;
                                       }
                                    })()}
                                 </div>
                                 <PdfViewer pdfData={sectionPerformanceData} />
                              </>
                        )}
                  </DialogContent>
                  
                  {/* Dialog Buttons */}
                  <DialogActions>
                        {/* Download Button */}
                        <Button color="primary" variant="contained" 
                           sx={{
                              minWidth: '40px',
                              minHeight: '50px',
                              backgroundColor: isDownloading ? 'grey' : '', // Set background color to grey if downloading
                              '&:hover': {
                                 backgroundColor: isDownloading ? 'grey' : '', // Ensure hover stays the same when downloading
                              },
                           }}
                           onClick={() => {
                              handleDownloading();
                              if (sectionPerformanceData) { // Check if sectionPerformanceData exists
                                 try {
                                       const blob = new Blob([sectionPerformanceData], { type: 'application/pdf' });
                                       const url = URL.createObjectURL(blob);
                                       const link = document.createElement('a');
                                       link.href = url;
                                       link.setAttribute('download', 'Section_Performance_Report.pdf');
                                       document.body.appendChild(link);
                                       link.click();
                                       link.remove();
                                 } catch (error) {
                                       console.error("Error creating or downloading PDF:", error);
                                 }
                              } else {
                                 console.error("sectionPerformanceData is undefined or null.");
                              }
                           }
                        }>
                           {isDownloading ?
                                 <LoadingIndicator size="md" />
                              :
                                 `Download PDF` 
                           }
                           
                        </Button>
                        {/* Cancel Button */}
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
                           onClick={() => {
                              setShowSectionPerformanceReportForm(false);
                              setShowSectionPerformancePdfViewer(false);
                           }
                        }>
                           Close
                        </Button>
                  </DialogActions>
               </>
            )}
         </Dialog>
      </div>   
   );
}

export default Tools;
