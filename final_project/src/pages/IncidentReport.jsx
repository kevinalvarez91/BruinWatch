import { useState } from "react";
import MyMap from "../components/Map";
import "../css/index.css";
import ResponsiveAppBar from "../components/Toolbar";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
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
        return;
      }
    } else {
      alert("Please mark a location on the map");
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
  
      // **Fix: Ensure we parse JSON response properly**
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        alert("Unexpected server response. Please try again.");
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
      }
    } catch (error) {
      console.error("Error reporting incident:", error);
      alert("A network error occurred. Please try again.");
    }
  };

  return (
    <div>
      <ResponsiveAppBar />
      {/* Full-screen map */}
      <div className="map-container">
        <MyMap onLocationSelect={(locationData) => {
            console.log("Received location:", locationData);
            setCoordinates(locationData);
        }} />
      </div>

      {/* Overlay for the form (on the left side) */}
      <div className="overlay">
        {/* Page Title */}
        <h1>Incident Report</h1>

        {/* Form Container */}
        <div className="flex-col">
          {/* Title Input */}
          <div className="flex-col">
            <label className="text-gray-700 font-semibold">Incident Title</label>
            <label className="text-gray-700 font-semibold">Mark a location via a pin</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a short title..."
            />
          </div>

          {/* Description Textarea */}
          <div className="flex-col">
            <label className="text-gray-700 font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident..."
              rows="4"
              className="textarea-custom"
            />
          </div>

          {/* Image Input */}
          <div className="flex-col">
            <label className="text-gray-700 font-semibold">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <img
                src={preview}
                alt="Image Preview"
                style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }}
              />
            )}
          </div>

          {/* Report Button */}
          <button onClick={handleSubmit} className="btn-primary">
            Report Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
