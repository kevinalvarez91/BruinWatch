import { useNavigate, Link } from "react-router-dom";
import Header from "./Header.jsx";
import { useState, useEffect } from "react";

function Preview({description, location, time}) {
  const [elapsed, setElapsed] = useState(Date.now() - time);

  return (
    <div className="preview_widget">
        <h2 className="text-xl font-bold text-center">{description}</h2>
        <div className="mt-4">
          <p className="text-gray-600"><strong>Location: </strong> {location} </p>
          <p className="text-gray-700"><strong>Time:</strong> {time} </p>
        </div>
        <Link to="/" className="p-2 bg-blue-500 text-white rounded">Details</Link>     {/* currently link back to login page */}

    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Header />
      <h1 className="text-4xl font-bold mb-6 text-gray-800">This is the Homepage</h1>
      <Preview description="scooter accident" location="bruinwalk" time="23:50 2/12/2025" />
      <Preview description="fire alarm" location="de neve plaza" time="12:00" />
      <Preview description="man with gun" location="bruin plaza" time="12:00" />
      <br/>
      <p className="text-gray-600">There are currently no other active incidents. Refresh or Click the button below to logout</p>
      <br/>
      <button 
        onClick={() => navigate("/")} 
        className="p-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  );
}
