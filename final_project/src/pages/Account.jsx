import React from 'react';
import '../css/Account.css';
import ResponsiveAppBar from "../components/Toolbar";

const Account = () => {
  return (
    <div className="account-container">
      <ResponsiveAppBar />
      <h1>Account Settings</h1>

      {/* Personal Information Section */}
      <section className="personal-info">
        <h2>Personal Information</h2>
        <div className="info-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" placeholder="John Doe" />
        </div>
        <div className="info-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" placeholder="john@example.com" />
        </div>
        <div className="info-group">
          <label htmlFor="contact">Contact Number:</label>
          <input type="tel" id="contact" placeholder="(123) 456-7890" />
        </div>
        <div className="info-group">
          <label htmlFor="aboutMe">About me:</label>
          <textarea id="aboutMe" placeholder="I am a software engineer." rows="4"></textarea>
        </div>
      </section>

      {/* Login & Security Settings Section */}
      <section className="login-security">
        <h2>Login & Security Settings</h2>
        <div className="info-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" placeholder="********" />
        </div>
        <div className="info-group">
          <label>Two-Factor Authentication:</label>
          <div className="two-factor">
            <button className="enable-2fa">Enable 2FA</button>
            <button className="disable-2fa">Disable 2FA</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;