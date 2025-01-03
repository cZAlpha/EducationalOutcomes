import React, { useState } from "react";
import { Button } from "@mui/material";

function RefreshButton({ rotateTimeInSeconds, onClick }) {
   const [isRotating, setIsRotating] = useState(false);

   const handleClick = () => {
      if (onClick) {
         onClick(); // Call the passed onClick handler (e.g., getLogs)
      }
      setIsRotating(true); // Trigger rotation
      setTimeout(() => setIsRotating(false), rotateTimeInSeconds * 1000); // Stop rotation after the specified duration
   };

   return (
      <Button
         onClick={handleClick}
         sx={{
            paddingTop: "0px",
            paddingBottom: "0px",
            fontSize: "1rem",
            color: "rgb(250 250 250)", // White text
            backgroundColor: "rgb(22 163 74)", // Tailwind's green-600
            "&:hover": {
               backgroundColor: "rgb(34 197 94)", // Tailwind's green-500
            },
            minWidth: "auto",
            maxHeight: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <span
            style={{
               display: "inline-block",
               transition: "transform 1s ease-in-out", // Smooth rotation
               transform: isRotating ? "rotate(360deg)" : "rotate(0deg)", // Rotate on state
            }}
         >
            ⟲
         </span>
      </Button>
   );
}

export default RefreshButton;
