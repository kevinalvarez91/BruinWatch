import ResponsiveAppBar from "../components/Toolbar";
import React from 'react';
import '../css/Contant.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement backend submission logic later.
  };

  return (
    <div className="contact-container">
      <ResponsiveAppBar />
      <h1>Contact Us</h1>
      <div className="contact-details">
        <div className="info">
          <h2>Our Information</h2>
          <p><strong>Email:</strong> bruinwatch@ucla.edu</p>
          <p><strong>Phone:</strong> +1 (310) 825-4321</p>
          <p><strong>Address:</strong> 405 Hilgard Avenue, Westwood, California, 90024</p>
          <p><strong>Business Hours:</strong> Mon-Fri: 9am - 5pm</p>
        </div>
        <div className="form-container">
          <h2>Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Your Name" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="Your Email" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                required 
                placeholder="Subject" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message" 
                name="message" 
                required 
                placeholder="Your Message"
              ></textarea>
            </div>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

  