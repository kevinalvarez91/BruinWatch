import React, { useState } from 'react';
import ResponsiveAppBar from "../components/Toolbar";
import '../css/Contant.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="contact-page">
      <ResponsiveAppBar />
      
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info-card">
            <h2>Contact Information</h2>
            <div className="contact-info-items">
              <div className="contact-info-item">
                <div className="icon location-icon">📍</div>
                <div>
                  <h3>Address</h3>
                  <p>405 Hilgard Avenue, Westwood, California, 90024</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="icon email-icon">✉️</div>
                <div>
                  <h3>Email</h3>
                  <p>bruinwatch@ucla.edu</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="icon phone-icon">📞</div>
                <div>
                  <h3>Phone</h3>
                  <p>+1 (310) 825-4321</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="icon clock-icon">🕒</div>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9am - 5pm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                      placeholder="Your name" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      placeholder="Your email" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                    placeholder="What is this regarding?" 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    required 
                    placeholder="Please type your message here..."
                    rows="5"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className={isSubmitting ? 'submitting' : ''}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;