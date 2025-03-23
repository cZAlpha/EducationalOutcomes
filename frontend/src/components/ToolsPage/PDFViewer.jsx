import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useState, useEffect } from 'react';

const PdfViewer = ({ pdfData }) => {
   const [pdfUrl, setPdfUrl] = useState(null);
   
   useEffect(() => {
      if (pdfData) {
         const blob = new Blob([pdfData], { type: 'application/pdf' });
         console.log("Created Blob:", blob); // Log the Blob
         const url = URL.createObjectURL(blob);
         setPdfUrl(url);
      }
   }, [pdfData]);
   
   return (
      <div style={{ height: '600px' }}>
         {pdfUrl ? (
               <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`}>
                  <Viewer fileUrl={pdfUrl} />
               </Worker>
         ) : (
               <p>Loading PDF...</p>
         )}
      </div>
   );
};

export default PdfViewer;