import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { USER } from "../constants";

function Account() {
   const [currentUser, setCurrentUser] = useState(null);

   const getUserData = () => {
      try {
         const userData = JSON.parse(localStorage.getItem(USER));
         if (userData) {
            setCurrentUser(userData);
         } else {
            setCurrentUser(null);
         }
      } catch (error) {
         console.error("Account Component | Error loading user from localStorage:", error);
         setCurrentUser(null);
      }
   };

   useEffect(() => {
      getUserData();
   }, []);

   return (
      <>
         <Navbar />
         <div className="flex flex-col items-center justify-center w-full text-center p-12 min-h-screen bg-gray-100 backdrop-blur-md bg-opacity-[80%]">
            <h1 className="text-2xl font-bold mb-8">Account Details</h1>
            {currentUser ? (
               <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl space-y-6">
                  <div className="flex flex-col gap-y-4 text-left">
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">First Name:</p>
                        <p>{currentUser.first_name}</p>
                     </div>
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">Last Name:</p>
                        <p>{currentUser.last_name}</p>
                     </div>
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">Email:</p>
                        <p>{currentUser.email}</p>
                     </div>
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">D-Number:</p>
                        <p>{currentUser.d_number}</p>
                     </div>
                     {currentUser.employee_id && ( // If the user has an employee ID, display it, otherwise don't
                        <div className="flex gap-x-2">
                           <p className="font-semibold text-gray-800">Employee ID:</p>
                           <p>{currentUser.employee_id}</p>
                        </div>
                     )}
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">Role:</p>
                        <p>{currentUser.role?.role_name}</p>
                     </div>
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">Role Description:</p>
                        <p>{currentUser.role?.role_description}</p>
                     </div>
                     <div className="flex gap-x-2">
                        <p className="font-semibold text-gray-800">Date Created:</p>
                        <p>{new Date(currentUser.date_created).toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            ) : (
               <p className="text-lg text-gray-500">No user information available.</p>
            )}
         </div>
      </>
   );
}

export default Account;
