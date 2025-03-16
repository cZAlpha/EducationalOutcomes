import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddEvaluationInstrumentButton = ({sectionId}) => {
   const navigate = useNavigate();
   
   const handleMainClick = () => {
      navigate(`/add-evaluation-instrument/manual/${sectionId}`); // Directly navigate to the desired path on click
   };
   
   return (
      <div className="relative inline-flex items-center">
         <Button
            onClick={handleMainClick}
            variant="contained"
            color="primary"
            sx={{ width: "auto", px: 1.5, py: 1, borderRadius: 3, boxShadow: 3 }}
         >
            <AddIcon />
         </Button>
      </div>
   );
};

export default AddEvaluationInstrumentButton;
