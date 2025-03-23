import React, { useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, DialogContentText, Autocomplete } from "@mui/material";
import api from "../api";


function Tools() {
   // State Vars for Modals
   const [showCoursePerformanceReportForm, setShowCoursePerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Course performance report form
   const [showSectionPerformanceReportForm, setShowSectionPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Section performance report form
   const [showEvaluationInstrumentPerformanceReportForm, setShowEvaluationInstrumentPerformanceReportForm] = useState(false); // Used to keep track of whether or not to show the Evaluation Instrument performance report form
   
   // Courses
   const [courses, setCourses] = useState([]);
   
   // START - Course Data Fetching
   const getCourses = async () => {
      api
         .get('/api/courses/')
         .then((res) => setCourses(res.data))
         .catch((err) => alert(`Error fetching courses: ${err.message}`));
   };
   // STOP  - Course Data Fetching   
   
   // ON MOUNT FUNCTION CALLS
   useEffect(() => { // On component mount, call all functions within this 
      const fetchData = async () => {
         await getCourses();
      };
      
      fetchData();
      console.log("Courses: ", courses);
   }, []);
   
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
            <DialogTitle>Course Performance Report</DialogTitle>
            <DialogContent>
               <p>Choose a Course to generate a report for</p>
               <Autocomplete
                  fullWidth
                  options={courses}
                  getOptionLabel={(option) => option.name} 
                  renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" margin="normal" />}
                  onChange={(event, newValue) => console.log("Selected Course: ", newValue)}
               />
            </DialogContent>
            <DialogActions>
               <div className="flex flex-row justify-between w-full pl-4 pr-4 mb-8">
               <Button color="error" variant="outlined" onClick={() => setShowCoursePerformanceReportForm(false)}>Cancel</Button>
               <Button type="submit" color="primary" variant="contained">Submit</Button>
               </div>
            </DialogActions>
         </Dialog>
         
      </div>   
   );
}

export default Tools;
