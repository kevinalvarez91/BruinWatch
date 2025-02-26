import React from 'react';
import '../css/Profile.css';
import ResponsiveAppBar from "../components/Toolbar";


const Profile = () => {
  // Example user data
  const user = {
    name: "John Doe",
    profilePic: "https://via.placeholder.com/150",
    about: "I am a passionate software developer who loves building innovative web applications and exploring new technologies.",
    contact: {
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567"
    },
    interests: ["Coding", "Traveling", "Photography", "Gaming"],
    age: 25,
    education: "Undergraduate", // or "Graduate"
    trustRating: 4.5 // Trust rating out of 5
  };

  return (
    <div className="profile-container">
    <ResponsiveAppBar />
      <div className="profile-header">
        <img 
          src={user.profilePic} 
          alt={`${user.name} Profile`} 
          className="profile-picture"
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
