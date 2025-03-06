import { useNavigate, Link, useLocation } from "react-router-dom";
import HomepageMap from "../components/MapHomepage";
import { useState, useEffect } from "react";
import ResponsiveAppBar from "../components/Toolbar";
import Search from "../components/Search";

function Preview({ title, description, location, lat, lng, image_path, created_at, id, onHover }) {
  const navigate = useNavigate();
  return (
    <div 
      className="preview_widget cursor-pointer"
      onMouseEnter={() => onHover(id)}  // Trigger hover event when mouse enters
      onMouseLeave={() => onHover(null)} // Reset hover state when mouse leaves
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
      <p><strong>Location: </strong>{location}</p>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIncidentId, setHighlightedIncidentId] = useState(null);

  // Filter previews based on search term
  const filteredPreviews = previews.filter(preview =>
    (preview.description && preview.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.title && preview.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.location && preview.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  // Function to handle hover event on preview
  const handleHover = (id) => {
    setHighlightedIncidentId(id); // Set the hovered incident id
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="map-container">
        <HomepageMap 
          incidents={previews} 
          highlightedIncidentId={highlightedIncidentId} // Pass hover state to map
        />
      </div>
      <div className="preview_overlay flex flex-col space-y-8">
        <h1>Latest Near You</h1>
        
        <Search onSearch={setSearchTerm} />
        
        <div className="preview_list">
          {filteredPreviews.map((preview) => (
            <Preview 
              key={preview.id}
              {...preview}  
              onHover={handleHover} // Pass hover handler to Preview
            />
          ))}
        </div>
      </div>
    </div>
  );
}