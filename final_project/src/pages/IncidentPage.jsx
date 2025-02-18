import { useState } from "react";
import scooterIncident from "../assets/scooterIncident.jpg";

const IncidentPage = () => {
  const [isResolved, setIsResolved] = useState(false);
  const handleResolvedClick = () => {
    setIsResolved(true);
  }
  return (
    
    <div className="flex justify-center w-full">
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 style={{ textAlign: "center" }}>Scooter Accident</h2>
      <h3 style={{ textAlign: "center" }}>Location: Bruinwalk</h3>
    
          <h4 className="text-lg font-medium" style={{ textAlign: "center" }}>
            Description: I was just walking and saw someone get
            run over by someone speeding in a scooter, ucla needs 
            enforce no scooter policies more harshley!  The person
            who got hit is said to have broken their arm, while the
            person on scooter fled the scene.
          </h4>
    </div>
    <div className="flex justify-center w-full">
     <img 
       src={scooterIncident} 
       alt="Scooter Incident" 
       width="500" 
       className="mx-auto my-4 block"
      />
    </div>
   
 <div>
       
       <button
        onClick={handleResolvedClick}
        className={`p-2 text-white rounded transition ${
          isResolved ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
        }`}
      >
        {isResolved ? "Resolved ✅" : "Resolved"}
      </button>
      <button>Active</button>
      
      <h4>Comments</h4>
  </div>
  </div>
  
   
  );
};

export default IncidentPage;