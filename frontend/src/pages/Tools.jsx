import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, DialogContentText, Autocomplete } from "@mui/material";
import api from "../api";
import LoadingIndicator from "../components/LoadingIndicator";
import PdfViewer from "../components/ToolsPage/PDFViewer";


function Tools() {
   // State Vars for Modals
   const [showCoursePerformanceReportForm, setShowCoursePerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Course performance report form
   const [showSectionPerformanceReportForm, setShowSectionPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Section performance report form
   const [showEvaluationInstrumentPerformanceReportForm, setShowEvaluationInstrumentPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Evaluation Instrument performance report form
   const [isLoading, setIsLoading] = useState(false); // Add loading state
   
   // Courses
   const [courses, setCourses] = useState([]);
   // Selected Course (from course performance report form)
   const [selectedCourse, setSelectedCourse] = useState(null);
   // Object used to store the performance data gathered for the selectedCourse
   const [coursePerformanceData, setCoursePerformanceData] = useState({}); 
   const [showCoursePerformancePdfViewer, setShowCoursePerformancePdfViewer] = useState(false);

   
   // START - Course Data Fetching
   const getCourses = async () => {
      api
         .get('/api/courses/')
         .then((res) => setCourses(res.data))
         .catch((err) => alert(`Error fetching courses: ${err.message}`));
   };
   // STOP  - Course Data Fetching 
   
   // START - Course Performance Data Fetching 
   const getCoursePerformance = async () => {
      if (selectedCourse) {
            setIsLoading(true);
            try {
               const res = await api.get(`/api/courses/${selectedCourse}/performance`, {
                  responseType: 'arraybuffer', // Important: Get the response as arraybuffer
               });

               setCoursePerformanceData(res.data); // pass the arraybuffer directly.
            } catch (err) {
               alert(`Error fetching course performance data: ${err.message}`);
            } finally {
               setIsLoading(false);
            }
      } else {
            console.log("Error fetching course performance data due to no course being selected!");
      }
   };
   // STOP  - Course Performance Data Fetching
   
   const handleSubmit = async () => {
      if (selectedCourse) {
         setIsLoading(true); // Set loading state to true
         await getCoursePerformance(); // Await the finishing of the grabbing of performance data
         setIsLoading(false); // Stop loading indicator
         setShowCoursePerformancePdfViewer(true); // Switch to PDF viewer after data is loaded
      } else {
         // Handle the case where no course is selected
         console.log("Please select a course.");
         // Optionally, display an error message to the user
      }
   };
   
   // ON MOUNT FUNCTION CALLS
   useEffect(() => { // On component mount, call all functions within this 
      const fetchData = async () => {
         await getCourses();
      };
      
      fetchData();
      console.log("Courses: ", courses);
   }, []);
   
   // TESTING ONLY
   useEffect(() => {
      console.log("Course Performance Data: ", coursePerformanceData);
   }, [coursePerformanceData]);
   useEffect(() => {
      console.log("Loading: ", isLoading);
      console.log("showCoursePerformancePdfViewer: ", showCoursePerformancePdfViewer);
   }, [isLoading, showCoursePerformancePdfViewer]);
   
   return (
      <div className="flex flex-col gap-y-10 items-center h-screen mt-12 justify-start"> {/* Main Container */}
         {/* Header */}
         <div className="w-full flex flex-col items-center gap-y-4">
            <h1 className="font-bold text-4xl text-white">Tools</h1>
         </div>
         
         {/* Container */}
         <div 
            className={`flex flex-col justify-center space-y-6 w-[90vw] md:w-[60vw] bg-[#ffffffb3] rounded-md px-8 py-8 mx-auto transition-opacity duration-300 ${
               showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
         >
            {/* Course Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Course Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given course.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowCoursePerformanceReportForm(true)}
                  disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
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
                  disabled={true}
                  // UNCOMMENT THIS WHEN YOU ACTUALLY IMPLEMENT IT: disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Student Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Student Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take into account all CLOs and PLOs a given student has completed evaluation instrument(s) for and given their performance indicators for each one.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                  // UNCOMMENT THIS WHEN YOU ACTUALLY IMPLEMENT IT: disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Evaluation Instrument Performance Evaluation */}
            <div className="flex flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Evaluation Instrument Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take a given evaluation instrument and give key indicators of student performance on the given CLOs for that evaluation instrument.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                  // UNCOMMENT THIS WHEN YOU ACTUALLY IMPLEMENT IT: disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
         </div>
         
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
                        onChange={(event, newValue) => setSelectedCourse(newValue?.course_id)}
                     />
                  </DialogContent>
                  <DialogActions>
                     <Button color="error" variant="outlined" onClick={() => setShowCoursePerformanceReportForm(false)}>Cancel</Button>
                     <Button type="submit" color="primary" variant="contained" onClick={handleSubmit}>Submit</Button>
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
                  <DialogTitle>Course Performance Report</DialogTitle>
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
                  <DialogActions>
                        <Button color="primary" variant="contained" onClick={() => {
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
                        }}>
                           Download PDF
                        </Button>
                        <Button color="error" variant="outlined" onClick={() => {
                           setShowCoursePerformanceReportForm(false);
                           setShowCoursePerformancePdfViewer(false);
                        }}>
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
