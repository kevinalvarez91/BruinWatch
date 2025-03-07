import { useNavigate, Link, useLocation } from "react-router-dom";
import HomepageMap from "../components/MapHomepage";
import { useState, useEffect } from "react";
import ResponsiveAppBar from "../components/Toolbar";
import Search from "../components/Search";

function Preview({ title, description, location, lat, lng, image_path, created_at, id, distance, onHover }) {
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
      {distance !== undefined && distance !== Infinity && (
        <p><strong>Distance: </strong>{distance.toFixed(2)} km</p>
      )}
      <p><strong>Reported at: </strong>{new Date(created_at).toLocaleString()}</p>
      <Link to={`/incident/${id}`} className="p-2 bg-blue-500 text-white rounded">
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
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState("time");

  // Filter previews based on search term
  const sortedPreviews = previews
    .map((preview) => {
      if (userLocation) {
        const distance = getDistance(userLocation.lat, userLocation.lng, preview.lat, preview.lng);
        return { ...preview, distance };
      }
      return { ...preview, distance: Infinity };
    })
    .sort((a, b) => {
      if (sortBy === "location") {
        return a.distance - b.distance;
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const filteredPreviews = sortedPreviews.filter(preview =>
    (preview.description && preview.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.title && preview.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.location && preview.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log("user's location: ", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("error when fetching user location:", error);
        }
      );
    }
    else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function getDistance(user_lat, user_lng, incident_lat, incident_lng){
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(incident_lat - user_lat);
    const dLon = toRad(incident_lng - user_lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(user_lat)) * Math.cos(toRad(incident_lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

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
        <div>
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="location">Nearest</option>
            <option value="time">Most Recent</option>
          </select>
        </div>
        <div className="preview_list">
        {filteredPreviews.map((preview) => (
            <Preview 
              key={preview.id}
              {...preview}  
              onHover={handleHover} // handle hover
            />
          ))}
        </div>
      </div>
    </div>
  );
}