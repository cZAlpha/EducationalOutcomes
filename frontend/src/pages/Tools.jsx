import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, DialogContentText, Autocomplete } from "@mui/material";
import api from "../api";
import LoadingIndicator from "../components/LoadingIndicator";


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
         api
            .get(`/api/courses/${selectedCourse}/performance`)
            .then((res) => setCoursePerformanceData(res.data))
            .catch((err) => alert(`Error fetching course performance data: ${err.message}`));
      } else {
         // Handle the case where no course is selected
         console.log("Error fetching course performance data due to no course being selected!");
      }
   };
   // STOP  - Course Performance Data Fetching
   
   const handleSubmit = async () => {
      if (selectedCourse) {
         setIsLoading(true); // Set loading state to true
         await getCoursePerformance(); // Await the finishing of the grabbing of performance data
         setShowCoursePerformanceReportForm(false); // Close the modal after data is grabbed
         setIsLoading(false); // Set loading state to false
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
   
   return (
      <div className="flex flex-col gap-y-10 items-center h-screen mt-12 justify-start"> {/* Main Container */}
         {/* Header */}
         <div className="w-full flex flex-col items-center gap-y-4">
            <h1 className="font-bold text-4xl text-white">Tools</h1>
         </div>
         
         {/* Container */}
         <div 
            className={`flex flex-col justify-center space-y-6 w-[60vw] bg-[#ffffffb3] rounded-md px-8 py-8 mx-auto transition-opacity duration-300 ${
               showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
         >
            {/* Course Performance Evaluation */}
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
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
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Section Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take your CLO to PLO mappings into account, and give your overall student performance indicators for your given CLOs and PLOs for the given section.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Student Performance Evaluation */}
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Student Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take into account all CLOs and PLOs a given student has completed evaluation instrument(s) for and given their performance indicators for each one.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
            
            {/* Evaluation Instrument Performance Evaluation */}
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 w-full bg-gray-100 rounded-lg p-4">
               <div className="flex flex-col gap-y-2 w-full">
                  <h1 className="text-2xl font-semi-bold">Evaluation Instrument Performance Evaluation</h1>
                  <p className="text-sm text-gray-700">This will take a given evaluation instrument and give key indicators of student performance on the given CLOs for that evaluation instrument.</p>
               </div>
               <button 
                  className="ml-6 bg-blue-500 flex-grow text-white px-4 py-2 rounded-md w-[100px] h-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={showCoursePerformanceReportForm || showSectionPerformanceReportForm || showEvaluationInstrumentPerformanceReportForm}
               >
                  <AddIcon />
               </button>
            </div>
         </div>
         
         {/* Course Performance Report Modal*/}
         <Dialog open={showCoursePerformanceReportForm} maxWidth="sm" fullWidth>
            {!isLoading && (
               <>
                  <DialogTitle>Course Performance Report</DialogTitle>
                  <DialogContent>
                     <p>Choose a Course to generate a report for</p>
                     <Autocomplete
                        fullWidth
                        options={courses}
                        getOptionLabel={(option) => option.name} 
                        renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" margin="normal" />}
                        onChange={(event, newValue) => setSelectedCourse(newValue?.course_id)} // Update selectedCourse state
                     />
                  </DialogContent>
                  <DialogActions>
                     <div className="flex flex-row justify-between w-full pl-4 pr-4 mb-8">
                        <Button color="error" variant="outlined" onClick={() => setShowCoursePerformanceReportForm(false)}>Cancel</Button>
                        <Button type="submit" color="primary" variant="contained" onClick={handleSubmit}>Submit</Button>
                     </div>
                  </DialogActions>
               </>
            )}
            {isLoading && (
               <>
                  <DialogTitle>Fetching Performance Information...</DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                     <LoadingIndicator />
                  </div>
                  <DialogActions style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <Button color="error" variant="outlined" onClick={() => setShowCoursePerformanceReportForm(false)}>Close</Button>
                  </DialogActions>
               </>
            )}
         </Dialog>
         
      </div>   
   );
}

export default Tools;
