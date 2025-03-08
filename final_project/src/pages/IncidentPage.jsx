import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ResponsiveAppBar from "../components/Toolbar";
import "../css/IncidentPage.css";

const IncidentPage = () => {
  const { incidentId } = useParams(); // Get the ID from the URL
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const [commentData, setCommentData] = useState({
    commentText: "",
    comments: []
  });

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

  const handleResolvedClick = () => {
    setIsResolved(true);
  };

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

        {/* Incident Image */}
        {incident.image_path && (
          <img
            src={`http://localhost:5001/${incident.image_path}`}
            alt={incident.title}
            width="500"
            className="mx-auto my-4 block"
          />
        )}

        {/* Resolved/Active Buttons */}
        <div className="button-container">
          <button
            className={`active-button ${!isResolved ? "active" : ""}`}
            onClick={() => setIsResolved(false)}
          >
            Active
          </button>
          <button
            className={`resolved-button ${isResolved ? "resolved" : ""}`}
            onClick={handleResolvedClick}
          >
            Resolved
          </button>
        </div>

        {/* Comment Section */}
        <div className="comment-section">
          <p>Roar Board</p>

          {/* Comment Input */}
          <div className="comment-container">
            <div className="comment-input">
              <textarea
                type="text"
                placeholder="Type a thought..."
                value={commentData.commentText}
                onChange={(e) =>
                  setCommentData({ ...commentData, commentText: e.target.value })
                }
              />
              <button
                onClick={() => {
                  if (commentData.commentText.trim() === "") return;

                  setCommentData({
                    ...commentData,
                    comments: [...commentData.comments, commentData.commentText],
                    commentText: ""
                  });
                }}
              >
                Roar
              </button>
            </div>

            {/* temporary comment section*/}
            <ul className="all-comments">
              {commentData.comments.map((comment, index) => (
                <li key={index} className="comment">
                  <textarea readOnly value={comment} className="comment-box" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentPage;
