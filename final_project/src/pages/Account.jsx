import React, { useState, useEffect } from 'react';
import '../css/Account.css';
import ResponsiveAppBar from "../components/Toolbar";

const Account = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    about: "",
    contact: {
      email: "",
      phone: ""
    },
  });
    
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState('');
  
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
          setPersonalInfo(userData);
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
  
  // Device detection useEffect (from main branch)
  useEffect(() => {
    function detectBrowser() {
      const userAgent = navigator.userAgent;
      let browserName = "Unknown Browser";
      if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
      } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
        browserName = "Opera";
      } else if (userAgent.indexOf("Trident") > -1) {
        browserName = "Internet Explorer";
      } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
      } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
      } else if (userAgent.indexOf("Safari") > -1) {
        // Chrome's userAgent also includes "Safari", so Chrome is checked first.
        browserName = "Safari";
      }
      return browserName;
    }
    
    function detectOS() {
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      let os = "Unknown OS";
      if (platform.indexOf("win") > -1) {
        os = "Windows";
      } else if (platform.indexOf("mac") > -1) {
        os = "macOS";
      } else if (platform.indexOf("linux") > -1) {
        os = "Linux";
      } else if (/android/.test(userAgent)) {
        os = "Android";
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        os = "iOS";
      }
      return os;
    }
    
    const browser = detectBrowser();
    const os = detectOS();
    setDeviceInfo(`${browser} on ${os}`);
  }, []);
  
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
  
    // If the field belongs under `contact`, handle it differently
    if (id === "email") {
      setPersonalInfo(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          email: value
        }
      }));
    } else if (id === "contact") {
      // Actually, rename `id="contact"` to `id="phone"` in your <input> to avoid confusion
      setPersonalInfo(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          phone: value
        }
      }));
    } else if (id === "about") {
      setPersonalInfo(prev => ({
        ...prev,
        about: value
      }));
    } else if (id === "name") {
      setPersonalInfo(prev => ({
        ...prev,
        name: value
      }));
    }
  };
  
  const handleContactChange = (e) => {
    const { id, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [id]: value
      }
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Make the actual PUT request to your backend
      const response = await fetch("http://localhost:5001/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // so the session cookie is included
        body: JSON.stringify({
          name: personalInfo.name,
          email: personalInfo.contact.email,
          phone: personalInfo.contact.phone,
          about: personalInfo.about
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update user:", errorData);
        alert(`Failed to update user: ${errorData.message}`);
      } else {
        console.log("User updated successfully");
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
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
                      value={personalInfo.contact.email}
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
                      id="phone" 
                      value={personalInfo.contact.phone}
                      onChange={handleContactChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="about">About Me</label>
                    <textarea 
                      id="about"
                      rows="4"
                      value={personalInfo.about}
                      onChange={handlePersonalInfoChange}
                      disabled={!isEditing}
                      className={!isEditing ? 'readonly' : ''}
                    ></textarea>
                    {isEditing && (
                      <div className="character-count">
                        {personalInfo.about.length}/200 characters
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
                            <div className="device-name">{deviceInfo}</div>
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
