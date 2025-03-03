import { useNavigate, Link, useLocation } from "react-router-dom";
import HomepageMap from "../components/MapHomepage";
import { useState, useEffect } from "react";
import ResponsiveAppBar from "../components/Toolbar";

function Preview({ title, description, lat, lng, image_path, created_at }) {
  const navigate = useNavigate();
  return (
    <div 
      className="preview_widget cursor-pointer"
      onClick={() => navigate("/IncidentPage")}
    >
      <h2>{title}</h2>
      {image_path && (
        <img 
          src={`http://localhost:5001/${image_path}`} 
          alt={title} 
          style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }}
        />
      )}
      <p>{description}</p>
      <p><strong>Coordinates: </strong>{lat}, {lng}</p>
      <p><strong>Reported at: </strong>{new Date(created_at).toLocaleString()}</p>
      <Link to="/IncidentPage" className="p-2 bg-blue-500 text-white rounded">
        Details
      </Link>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Fetch incident reports from the server
    fetch("http://localhost:5001/reports")
      .then(res => res.json())
      .then(data => {
        setPreviews(data);
      })
      .catch(error => console.error(error));

    // If a new report was just submitted, add it to the top of the list.
    const newPreviewFromReport = location.state?.newPreview;
    if (newPreviewFromReport) {
      setPreviews(prev => [newPreviewFromReport, ...prev]);
    }
  }, [location.state]);

  return (
    <div>
      <ResponsiveAppBar />
      <div className="map-container">
        <HomepageMap />
      </div>
      <div className="preview_overlay">
        <h1>Latest Near You</h1>
        <div className="preview_list">
          {previews.map((preview, index) => (
            <Preview key={index} {...preview} />
          ))}
        </div>
      </div>
    </div>
  );
}
