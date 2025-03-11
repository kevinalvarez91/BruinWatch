import React, { useState } from 'react';
import '../css/Account.css';
import ResponsiveAppBar from "../components/Toolbar";

const Account = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    contact: '(123) 456-7890',
    aboutMe: 'I am a software engineer.'
  });
  
  const [securityInfo, setSecurityInfo] = useState({
    password: '',
    twoFactorEnabled: false
  });
  
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const handlePersonalInfoChange = (e) => {
    const { id, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSecurityInfoChange = (e) => {
    const { id, value } = e.target;
    setSecurityInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const toggleTwoFactor = () => {
    setSecurityInfo(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="account-page">
      <ResponsiveAppBar />
      
      <div className="account-container">
        <div className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your personal information and security preferences</p>
        </div>
        
        <div className="account-content">
          <div className="account-sidebar">
            <nav className="account-nav">
              <button 
                className={`nav-item ${activeSection === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveSection('personal')}
              >
                <span className="nav-icon">👤</span>
                Personal Information
              </button>
              <button 
                className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => setActiveSection('security')}
              >
                <span className="nav-icon">🔒</span>
                Login & Security
              </button>
            </nav>
          </div>
          
          <div className="account-main">
            {savedSuccess && (
              <div className="success-notification">
                <span className="success-icon">✓</span>
                Your changes have been saved successfully!
              </div>
            )}
            
            {activeSection === 'personal' && (
              <section className="account-section personal-info-section">
                <div className="section-header">
                  <h2>Personal Information</h2>
                  {!isEditing ? (
                    <button 
                      className="edit-button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        className="cancel-button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-button"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="section-content">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    />
                    {!isEditing && (
                      <span className="verified-badge">✓ Verified</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="contact">Contact Number</label>
                    <input 
                      type="tel" 
                      id="contact" 
                      value={personalInfo.contact}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="aboutMe">About Me</label>
                    <textarea 
                      id="aboutMe" 
                      rows="4"
                      value={personalInfo.aboutMe}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    ></textarea>
                    {isEditing && (
                      <div className="character-count">
                        {personalInfo.aboutMe.length}/200 characters
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            
            {activeSection === 'security' && (
              <section className="account-section security-section">
                <div className="section-header">
                  <h2>Login & Security Settings</h2>
                </div>
                
                <div className="section-content">
                  <div className="security-card password-section">
                    <div className="security-item-header">
                      <h3>Password</h3>
                      <button className="change-button">Change Password</button>
                    </div>
                    <div className="security-item-content">
                      <p>Last changed: 2 months ago</p>
                      <div className="password-strength">
                        <div className="strength-label">Password strength:</div>
                        <div className="strength-meter">
                          <div className="strength-level strong"></div>
                        </div>
                        <span className="strength-text">Strong</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="security-card two-factor-section">
                    <div className="security-item-header">
                      <h3>Two-Factor Authentication</h3>
                      <button 
                        className={`toggle-button ${securityInfo.twoFactorEnabled ? 'enabled' : 'disabled'}`}
                        onClick={toggleTwoFactor}
                      >
                        {securityInfo.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <div className="security-item-content">
                      <p>
                        {securityInfo.twoFactorEnabled 
                          ? 'Your account is protected with two-factor authentication.' 
                          : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
                      </p>
                      {securityInfo.twoFactorEnabled && (
                        <div className="verification-methods">
                          <div className="method">
                            <span className="method-name">Authenticator App</span>
                            <span className="method-status">✓ Active</span>
                          </div>
                          <div className="method">
                            <span className="method-name">SMS Verification</span>
                            <span className="method-status">Not set up</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="security-card devices-section">
                    <div className="security-item-header">
                      <h3>Devices & Sessions</h3>
                      <button className="view-button">View All</button>
                    </div>
                    <div className="security-item-content">
                      <div className="current-session">
                        <div className="device-info">
                          <span className="device-icon">💻</span>
                          <div>
                            <div className="device-name">Chrome on macOS</div>
                            <div className="session-details">Current session • Los Angeles, CA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;