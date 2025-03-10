import React, { useEffect, useState } from 'react';
import '../css/Profile.css';
import ResponsiveAppBar from "../components/Toolbar";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    profilePic: "NULL",
    about: "About me placeholder",
    contact: {
      email: "",
      phone: ""
    },
    interests: ["Drawing", "Coding"],
    age: 0,
    education: "Undergraduate",
    trustRating: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          credentials: 'include'
        });
        const text = await response.text();
        if (response.ok) {
          const userData = JSON.parse(text);
          setUser(userData);
        } else {
          setError("Failed to fetch user data");
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        setError("Error connecting to server");
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Full star
        stars.push(<span key={i} className="star filled">★</span>);
      } else {
        // Empty star
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <ResponsiveAppBar />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <ResponsiveAppBar />
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ResponsiveAppBar />
      
      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-cover-image"></div>
          <div className="profile-header-content">
            <img 
              src={user.profilePic === "NULL" ? "/src/assets/ucla.jpg" : user.profilePic}
              alt={`${user.name}'s profile`} 
              className="profile-picture"
              onError={(e) => { e.target.src = '/images/ucla.jpg'; }} 
            />
            <div className="profile-basic-info">
              <h1>{user.name || "Your Name"}</h1>
              <div className="profile-badges">
                <span className="badge age-badge">{user.age || "N/A"} years old</span>
                <span className="badge education-badge">{user.education || "N/A"} Student</span>
                <div className="trust-badge">
                  <span className="trust-label">Trust Rating:</span>
                  <div className="star-rating">
                    {renderStars(user.trustRating)}
                    <span className="rating-number">({user.trustRating}/5)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-main">
            <section className="profile-section about-section">
              <h2>About Me</h2>
              <div className="section-content">
                <p>{user.about || "No information provided"}</p>
              </div>
            </section>
            
            <section className="profile-section interests-section">
              <h2>Interests</h2>
              <div className="section-content">
                {user.interests && user.interests.length > 0 ? (
                  <div className="interests-list">
                    {user.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                ) : (
                  <p>No interests listed</p>
                )}
              </div>
            </section>
          </div>
          
          <div className="profile-sidebar">
            <section className="profile-section contact-section">
              <h2>Contact Information</h2>
              <div className="section-content">
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div className="contact-details">
                    <h3>Email</h3>
                    {user.contact && user.contact.email ? (
                      <a href={`mailto:${user.contact.email}`}>{user.contact.email}</a>
                    ) : (
                      <p className="no-info">No email provided</p>
                    )}
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div className="contact-details">
                    <h3>Phone</h3>
                    {user.contact && user.contact.phone ? (
                      <p>{user.contact.phone}</p>
                    ) : (
                      <p className="no-info">No phone provided</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
            
            <section className="profile-section actions-section">
              <button className="action-button primary-button">Message</button>
              <button className="action-button secondary-button">Share Profile</button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;