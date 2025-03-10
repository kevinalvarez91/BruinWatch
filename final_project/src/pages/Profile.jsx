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
    interests: ["Drawing ", "Coding"],
    age: 0,
    education: "Undergraduate", // or "Graduate"
    trustRating: 0 // Trust rating out of 5
  });

  useEffect(() => {
    // Fetch user data from the server
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          credentials: 'include' // Include cookies for session-based authentication
        });
        const text = await response.text();
        if (response.ok) {
          const userData = JSON.parse(text);
          setUser(userData);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="profile-container">
      <ResponsiveAppBar />
      <div className="profile-header">
        <img 
          src={user.profilePic} 
          alt={`${user.name} Profile`} 
          className="profile-picture"
          onError={(e) => { e.target.src = 'path_to_default_image.png'; }} // Add a default image in case of error
        />
        <div className="profile-basic">
          <h1>{user.name}</h1>
          <p className="age">{user.age} years old</p>
          <p className="education">{user.education} Student</p>
        </div>
      </div>
      
      <div className="profile-about">
        <h2>About Me</h2>
        <p>{user.about}</p>
      </div>
      
      <div className="profile-contact">
        <h2>Contact</h2>
        <p>Email: <a href={`mailto:${user.contact.email}`}>{user.contact.email}</a></p>
        <p>Phone: {user.contact.phone}</p>
      </div>
      
      <div className="profile-interests">
        <h2>Interests</h2>
        <ul>
          {user.interests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </div>
      
      <div className="profile-trust-rating">
        <h2>Trust Rating</h2>
        <div className="rating">
          <span>{user.trustRating} / 5</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;