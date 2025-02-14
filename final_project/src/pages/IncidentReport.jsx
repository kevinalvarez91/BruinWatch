import { useState } from "react";
import MyMap from "../components/Map";
import "../css/index.css";

const Report = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    alert(`Incident Reported!\nTitle: ${title}\nDescription: ${description}`);
  };

  return (
    <div>
      {/* Full-screen map */}
      <div className="map-container">
        <MyMap />
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