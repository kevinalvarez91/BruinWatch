import { useState } from "react";
import MyMap from "../components/Map";
import "../css/Report.css"; // Import our new CSS file
import ResponsiveAppBar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter an incident title");
      return;
    }
    
    if (!description.trim()) {
      alert("Please provide a description of the incident");
      return;
    }
    
    if (!coordinates) {
      alert("Please mark a location on the map");
      return;
    }
    
    setIsSubmitting(true);
    
    console.log("Coordinates before sending:", coordinates);
      
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
  
    if (coordinates) {
      const latVal = coordinates?.lat ? parseFloat(coordinates.lat).toFixed(4) : null;
      const lngVal = coordinates?.lng ? parseFloat(coordinates.lng).toFixed(4) : null;
      const locationName = coordinates?.location.split(', Los Angeles County')[0] || "Unknown Location";
  
      console.log("Sending lat:", latVal, "lng:", lngVal, "location:", locationName);
          
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        formData.append("lat", latVal.toString());
        formData.append("lng", lngVal.toString());
        formData.append("location", locationName);
      } else {
        alert("Please select a valid location on the map");
        setIsSubmitting(false);
        return;
      }
    } else {
      alert("Please mark a location on the map");
      setIsSubmitting(false);
      return;
    }
      
    if (image) {
      formData.append("image", image);
    }
    
    try {
      const res = await fetch("http://localhost:5001/report", {
        method: "POST",
        body: formData,
      });
  
      // Ensure we parse JSON response properly
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        alert("Unexpected server response. Please try again.");
        setIsSubmitting(false);
        return;
      }
  
      console.log("Server response:", data);
  
      if (res.ok) {
        alert("Incident Reported successfully!");
  
        const newPreview = {
          title: title,
          description: description,
          location: coordinates?.location,
          lat: coordinates?.lat,
          lng: coordinates?.lng,
          created_at: new Date().toISOString()
        };
  
        navigate("/home", { state: { newPreview } });
      } else {
        console.error("Server reported an error:", data);
        alert(`Failed to report incident: ${data.message || "Unknown error"}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error reporting incident:", error);
      alert("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-container">
      <ResponsiveAppBar />
      
      {/* Full-screen map */}
      <div className="map-container">
        <MyMap onLocationSelect={(locationData) => {
            console.log("Received location:", locationData);
            setCoordinates(locationData);
        }} />
      </div>

      {/* Overlay for the form */}
      <div className="overlay">
        {/* Page Title */}
        <h1>Incident Report</h1>

        {/* Form Container */}
        <div className="flex-col">
          {/* Title Input */}
          <div className="input-group">
            <label htmlFor="incident-title">Incident Title</label>
            <input
              id="incident-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a short title..."
            />
          </div>

          {/* Location instruction */}
          <div className="input-group">
            <label>Location</label>
            <p className="location-marker-label">Click on the map to mark the incident location</p>
            
            {coordinates && (
              <div className="location-indicator">
                <span className="location-indicator-icon">📍</span>
                <span className="location-indicator-text">
                  {coordinates.location || "Selected location"}
                </span>
              </div>
            )}
          </div>

          {/* Description Textarea */}
          <div className="input-group">
            <label htmlFor="incident-description">Description</label>
            <textarea
              id="incident-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              rows="4"
              className="textarea-custom"
            />
          </div>

          {/* Image Input */}
          <div className="input-group file-upload">
            <label>Upload Image</label>
            <div className="file-input-container">
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
            
            {preview && (
              <div className="image-preview">
                <img
                  src={preview}
                  alt="Image Preview"
                />
              </div>
            )}
          </div>

          {/* Report Button */}
          <button 
            onClick={handleSubmit} 
            className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Report Incident'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;