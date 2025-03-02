import { useState } from "react";
import scooterIncident from "../assets/scooterIncident.jpg";
import ResponsiveAppBar from "../components/Toolbar";
import "../css/IncidentPage.css";


const IncidentPage = () => {
  //for handling resolved -> will be used for the buttons that we will then add the bar for 
  const [isResolved, setIsResolved] = useState(0);
  const [isUnresolved, setIsUnresolved] = useState(0);
  const [commentData,setCommentData]=useState(
    {
      commentText:"",
      comments:[]
    }
  );


  const handleResolvedClick = () => {
    setIsResolved(true);
  }
  const handleUnresolvedClick = () => {
    setIsUnresolved(true);
  }
  return (
    //including the responsiveAppBar

    //this is for the title 
    <div className="incident-page">
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
      {/*this is for the comment section*/}
      <div className="button-container">
        <button className="active-button">
          Active
        </button>
        <button className="resolved-button">
          Resolved
        </button>
      </div>
      
      <div className="comment-section">
        <p>
          Roar Board
        </p>
        {/*for writing comments */}
        <div className="comment-container">
        <div className="comment-input">
          <textarea
            type="text" 
            placeholder="type a thought..."
            value={commentData.commentText}
            onChange={(e) => {
              setCommentData({...commentData,commentText: e.target.value});
            }} 
            
          />
          <button onClick={() => {
            //stop any empty comments 
            if( commentData.commentText.trim()==="") return;

            setCommentData({
              //keeping the old comments
              ...commentData,
              //adding the new comment
              comments:[...commentData.comments,commentData.commentText],
              //ckearing the comment input field
              commentText:""
            })
          }}
          >
            Roar
          </button>
        </div>
          {/*we now have a list of comments, time to display them*/}
          <ul className="all-comments">
            {commentData.comments.map((comment,index) => (
              <li key={index} className="comment">
               <textarea
                readOnly
                value={comment}
                className="comment-box"
                />
              </li>
            ))}
          </ul>
        </div>
        {/*this is for the active and unresolved buttons */}
      
      </div>
    </div>
    
    

    </div>
  
  );
};

export default IncidentPage;