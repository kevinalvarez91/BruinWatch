import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ResponsiveAppBar from "../components/Toolbar";

const IncidentPage = () => {
  const { incidentId } = useParams(); // Get the incident ID from the URL
  console.log("✅ useParams() Output:", useParams()); // Debugging log
  console.log("🚀 Incident ID received:", incidentId);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/reports/${incidentId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Incident not found");
        }
        return response.json();
      })
      .then((data) => {
        setIncident(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching incident:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [incidentId]);

  if (loading) return <p>Loading incident details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!incident) return <p>Incident not found.</p>;

  return (
    <div className="incident-page">
      <ResponsiveAppBar />
      <div className="title-container">
        <h1>{incident.title}</h1>
        <h3 className="location">Location: {incident.location}</h3>
        <p className="description">{incident.description}</p>
        {incident.image_path && (
          <img 
          src={`http://localhost:5001/${incident.image_path}`} 
          alt={incident.title} 
          width="500" 
        />
        )}
        <p><strong>Reported at:</strong> {new Date(incident.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default IncidentPage;
