import { useNavigate, useLocation } from "react-router-dom";
import HomepageMap from "../components/MapHomepage";
import { useState, useEffect } from "react";
import ResponsiveAppBar from "../components/Toolbar";
import Search from "../components/Search";
import "../css/IncidentStatusEnhanced.css"; 

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return "Just now";
}

function Preview({ title, description, location, lat, lng, image_path, created_at, id, distance, onHover, isResolved }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/incident/${id}`);
  };

  return (
    <div 
      className="preview_widget cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Status Badge */}
      <div className={`incident-status ${isResolved ? "incident-resolved" : "incident-active"}`}>
        {isResolved ? "Resolved" : "Active"}
      </div>

      <h2>{title}</h2>
      {image_path && (
        <img 
          src={`http://localhost:5001/${image_path}`} 
          alt={title} 
          style={{ 
            marginTop: "10px", 
            maxWidth: "100%", 
            height: "auto", 
            display: "block", 
            marginLeft: "auto", 
            marginRight: "auto" 
          }}
        />
      )}
      <p style={{
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 2,
        overflow: "hidden",
        textOverflow: "ellipsis"
        }}>
          {description}
      </p>
      <p><strong>Location: </strong>{location}</p>

      {distance !== undefined && distance !== Infinity && (
        <p>
          <strong>Distance: </strong>
          {distance.toFixed(2)} km ({(distance * 0.621371).toFixed(2)} miles)
        </p>
      )}
      <p><strong>Reported at: </strong>{new Date(created_at).toLocaleString()}</p>

      <p style={{ 
        textAlign: "right", 
        display: "block", 
        marginRight: "0" 
      }}>
        {timeSince(created_at)}
      </p>
      {/* <Link to={`/incident/${id}`} className="p-2 bg-blue-500 text-white rounded">
        Details
      </Link> */}

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
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("sortBy") || "time");
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem("filterStatus") || "all");

    // New: Check authentication status on mount
    useEffect(() => {
      fetch("http://localhost:5001/auth-status", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Not authenticated");
          return res.json();
        })
        .then((data) => {
          if (!data.authenticated) {
            navigate("/login");
          }
        })
        .catch((err) => {
          console.error("Auth check failed:", err);
          navigate("/login");
        });
    }, [navigate]);
    
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log("User's location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function getDistance(user_lat, user_lng, incident_lat, incident_lng) {
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
    // Fetch incidents
    fetch("http://localhost:5001/reports")
      .then(res => res.json())
      .then(data => {
        // Fetch votes for each incident to determine status
        Promise.all(
          data.map((incident) =>
            fetch(`http://localhost:5001/incident/${incident.id}/votes`)
              .then(res => res.json())
              .then(votes => {
                // Sort votes by creation date (latest first)
                const sortedVotes = votes.sort((a, b) => new Date(b.voted_at) - new Date(a.voted_at));
                // Get the last two votes
                const lastVote = sortedVotes[0]; // Get only the most recent vote
                const isResolved = lastVote?.status === "resolved"; // Check if it's "resolved"
                return { ...incident, isResolved };
              })
          )
        ).then(updatedIncidents => setPreviews(updatedIncidents));
      })
      .catch(error => console.error(error));

    const newPreviewFromReport = location.state?.newPreview;
    if (newPreviewFromReport) {
      setPreviews(prev => [newPreviewFromReport, ...prev]);
    }
  }, [location.state]);

  const sortedPreviews = previews
    .map((preview) => {
      if (userLocation && preview.lat !== undefined && preview.lng !== undefined) {
        const distance = getDistance(userLocation.lat, userLocation.lng, preview.lat, preview.lng);
        return { ...preview, distance };
      }
      return { ...preview, distance: Infinity };
    })
    .filter(preview => filterStatus === "all" || (filterStatus === "resolved" ? preview.isResolved : !preview.isResolved))
    .sort((a, b) => {
      if (sortBy === "location") {
        return a.distance - b.distance;
      } else {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

  const filteredPreviews = sortedPreviews.filter(preview =>
    (preview.description && preview.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.title && preview.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (preview.location && preview.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleHover = (id) => {
    setHighlightedIncidentId(id);
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="map-container">
      <HomepageMap 
      incidents={filteredPreviews} 
      highlightedIncidentId={highlightedIncidentId}
      filterStatus={filterStatus}
      userLocation={userLocation} // ✅ Ensure this is passed
      />
      </div>
      <div className="preview_overlay flex flex-col space-y-8">
        <h1>Latest Near You</h1>
        
        <Search onSearch={setSearchTerm} />
        <div>
          <label>Sort by: </label>
          <select
            value={sortBy}
            onChange={(e) => {
              const newSortBy = e.target.value;
              setSortBy(newSortBy);
              localStorage.setItem("sortBy", newSortBy);
          }}>
            <option value="location">Nearest</option>
            <option value="time">Most Recent</option>
          </select>

          <label style={{ marginLeft: "16px" }}>Filter by: </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              const newFilterStatus = e.target.value;
              setFilterStatus(newFilterStatus);
              localStorage.setItem("filterStatus", newFilterStatus);
          }}>
            <option value="all">All</option>
            <option value="resolved">Resolved</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div className="preview_list">
        {filteredPreviews.map((preview) => (
          <Preview 
            key={preview.id || `${preview.lat}-${preview.lng}`} 
            {...preview}  
            onHover={handleHover} 
          />
        ))}
        </div>
      </div>
    </div>
  );
}
