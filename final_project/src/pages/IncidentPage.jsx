import { useState } from "react";
import scooterIncident from "../assets/scooterIncident.jpg";
import ResponsiveAppBar from "../components/Toolbar";
import "../css/IncidentPage.css";


const IncidentPage = () => {
  //for 
  const [isResolved, setIsResolved] = useState(0);
  const [isUnresolved, setIsUnresolved] = useState(0);
  const handleResolvedClick = () => {
    setIsResolved(true);
  }
  const handleUnresolvedClick = () => {
    setIsUnresolved(true);
  }
  return (
    //including the responsiveAppBar

    //this is for the title 
    <div>
    <ResponsiveAppBar />
    <div className= "title-container">
      <h1>Scooter Accident</h1>
      <h3 className="location">Location: Bruinwalk</h3>
      {/*this is for the description */}
      <p className="description">
        Description: I was just walking and saw someone get
        run over by someone speeding in a scooter, ucla needs 
        enforce no scooter policies more harshly!  The person
        who got hit is said to have broken their arm, while the
        person on scooter fled the scene.  Also, to the people that
        kept trying to help. Thank you!
      </p>
      {/*now for the image */}
      <img 
        src={scooterIncident} 
        alt="Scooter Incident" 
        width="500" 
        className="mx-auto my-4 block"
        />
    </div>
    </div>
  
  );
};

export default IncidentPage;