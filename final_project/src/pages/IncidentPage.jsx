import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ResponsiveAppBar from "../components/Toolbar";
import "../css/IncidentPage.css";

const IncidentPage = () => {
  const { incidentId } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const commentSectionRef = useRef(null);
  const mainContentRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    // Fetch the logged-in user
    fetch("http://localhost:5001/home", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch((error) => console.error("Error fetching user:", error));

    // Fetch incident details
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

    // Fetch last 5 votes
    fetch(`http://localhost:5001/incident/${incidentId}/votes`)
      .then((response) => response.json())
      .then((data) => setVotes(data))
      .catch((error) => console.error("Error fetching votes:", error));

    // Fetch comments
    fetch(`http://localhost:5001/incident/${incidentId}/comments`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, [incidentId]);

  // Save scroll position before any state update that might cause rerender
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Restore scroll position after render
  useEffect(() => {
    if (scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [comments, votes, incident]);

  const submitVote = (status) => {
    const currentScrollPosition = window.scrollY;
    
    fetch(`http://localhost:5001/incident/${incidentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then(() => {
        fetch(`http://localhost:5001/incident/${incidentId}/votes`)
          .then((response) => response.json())
          .then((data) => {
            setVotes(data);
            // Restore scroll position after state update
            setTimeout(() => window.scrollTo(0, currentScrollPosition), 0);
          });
      })
      .catch((error) => console.error("Error submitting vote:", error));
  };

  const postComment = (text, parentCommentId = null) => {
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }

    // Save current scroll position
    const currentScrollPosition = window.scrollY;

    const newComment = {
      user_email: currentUser.email,
      user_name: currentUser.email.split("@")[0],
      user_profile: `https://i.pravatar.cc/40?u=${currentUser.email}`,
      text,
      parent_comment_id: parentCommentId,
    };

    fetch(`http://localhost:5001/incident/${incidentId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    })
      .then(() => fetch(`http://localhost:5001/incident/${incidentId}/comments`))
      .then((response) => response.json())
      .then((data) => {
        setCommentText("");
        setReplyText("");
        setReplyingTo(null);
        setComments(data);
        
        // Restore scroll position after state update and DOM changes
        setTimeout(() => window.scrollTo(0, currentScrollPosition), 0);
      })
      .catch((error) => console.error("Error posting comment:", error));
  };

  const handleReply = (commentId) => {
    // Save scroll position
    const currentScrollPosition = window.scrollY;
    
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(commentId);
      setReplyText("");
    }
    
    // Restore scroll position after the reply form appears/disappears
    setTimeout(() => window.scrollTo(0, currentScrollPosition), 0);
  };

  const submitReply = (parentCommentId) => {
    if (replyText.trim()) {
      postComment(replyText, parentCommentId);
    }
  };

  const reactToComment = (commentId, type) => {
    // Save scroll position
    const currentScrollPosition = window.scrollY;
    
    // Reference to the clicked heart for animation
    const heartButton = document.getElementById(`heart-${commentId}`);
    
    if (type === "like" && heartButton) {
      // Add animation class
      heartButton.classList.add('heart-animation');
      
      // Remove the class after animation completes
      setTimeout(() => {
        heartButton.classList.remove('heart-animation');
      }, 1000);
    }
    
    fetch(`http://localhost:5001/comment/${commentId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
      .then(() => fetch(`http://localhost:5001/incident/${incidentId}/comments`))
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
        // Restore scroll position after state update
        setTimeout(() => window.scrollTo(0, currentScrollPosition), 0);
      })
      .catch((error) => console.error("Error reacting to comment:", error));
  };

  if (loading) return <p>Loading incident details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!incident) return <p>Incident not found.</p>;

  return (
    <div className="incident-page">
      <ResponsiveAppBar />
      
      <div className="content-container" ref={mainContentRef}>
        <div className="title-container">
          <h1>{incident.title}</h1>
          <h3 className="location">Location: {incident.location}</h3>
          <p className="description">{incident.description}</p>

          {incident.image_path && (
            <div className="image-container">
              <img
                src={`http://localhost:5001/${incident.image_path}`}
                alt={incident.title}
                width="500"
                className="incident-image"
                onLoad={() => window.scrollTo(0, scrollPositionRef.current)}
              />
            </div>
          )}

          <div className="button-container">
            <button className="active-button" onClick={() => submitVote("active")}>
              Active
            </button>
            <button className="resolved-button" onClick={() => submitVote("resolved")}>
              Resolved
            </button>
          </div>

          <div className="vote-history">
            <p>Recent Votes:</p>
            <div className="vote-line">
              {votes.map((vote, index) => (
                <div
                  key={index}
                  className={`vote-marker ${vote.status}`}
                  title={`Voted ${vote.status} at ${new Date(vote.voted_at).toLocaleTimeString()}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="comment-section" ref={commentSectionRef}>
          <h3 className="comment-header-title">Roar Board</h3>

          {currentUser ? (
            <div className="comment-input">
              <div className="comment-input-header">
                {currentUser && (
                  <img src={`https://i.pravatar.cc/40?u=${currentUser.email}`} alt="User" className="comment-avatar" />
                )}
                <textarea
                  placeholder="Type a thought..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <button className="comment-button" onClick={() => postComment(commentText)}>Roar</button>
            </div>
          ) : (
            <p className="login-message">You must be logged in to comment</p>
          )}

          <ul className="all-comments">
            {comments
              .filter((comment) => !comment.parent_comment_id)
              .map((comment) => (
                <li key={comment.id} className="comment">
                  <div className="comment-header">
                    <img src={comment.user_profile} alt="User" className="comment-avatar" />
                    <div className="comment-user-info">
                      <span className="comment-username">{comment.user_name}</span>
                      <span className="comment-time">{new Date(comment.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button 
                      className="heart-button" 
                      onClick={() => reactToComment(comment.id, "like")}
                    >
                      <span 
                        id={`heart-${comment.id}`} 
                        className={`heart-icon ${comment.likes > 0 ? 'heart-filled' : ''}`}
                      >
                        {comment.likes > 0 ? '❤️' : '🤍'}
                      </span>
                      <span className="action-count">{comment.likes}</span>
                    </button>
                    <button className="reply-button" onClick={() => handleReply(comment.id)}>
                      <span className="action-icon">↩️</span> Reply
                    </button>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="reply-input">
                      {currentUser && (
                        <img src={`https://i.pravatar.cc/40?u=${currentUser.email}`} alt="User" className="comment-avatar" />
                      )}
                      <textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="reply-textarea"
                      />
                      <div className="reply-actions">
                        <button className="cancel-button" onClick={() => handleReply(null)}>Cancel</button>
                        <button className="reply-submit-button" onClick={() => submitReply(comment.id)}>Reply</button>
                      </div>
                    </div>
                  )}

                  {comments
                    .filter((reply) => reply.parent_comment_id === comment.id)
                    .map((reply) => (
                      <div key={reply.id} className="comment reply">
                        <div className="comment-header">
                          <img src={reply.user_profile} alt="User" className="comment-avatar" />
                          <div className="comment-user-info">
                            <span className="comment-username">{reply.user_name}</span>
                            <span className="comment-time">{new Date(reply.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <p className="comment-text">{reply.text}</p>
                        <div className="comment-actions">
                          <button 
                            className="heart-button" 
                            onClick={() => reactToComment(reply.id, "like")}
                          >
                            <span 
                              id={`heart-${reply.id}`} 
                              className={`heart-icon ${reply.likes > 0 ? 'heart-filled' : ''}`}
                            >
                              {reply.likes > 0 ? '❤️' : '🤍'}
                            </span>
                            <span className="action-count">{reply.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IncidentPage;