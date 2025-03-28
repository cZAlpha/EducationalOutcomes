import "../styles/LoadingIndicator.css"

const LoadingIndicator = ({ size = 'default' }) => {
   return (
      <div className={`loading-container ${size}`}>
         <div className="loader"></div>
      </div>
   );
}

export default LoadingIndicator;
