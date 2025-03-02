import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from '../assets/bear_with_glasses.jpg';
import '../css/LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

    // Check if the user is already logged in
    useEffect(() => {
      fetch("http://localhost:5001/login", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            navigate("/home");  // Redirect if already logged in
          }
        })
        .catch(err => console.error("Error checking auth status:", err));
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),  // Send email instead of username
        credentials: "include",
      });

      const data = await response.json();

      if(response.ok) {
        navigate("/home"); // redirect to home after login
      } else {
        setMessage(data.message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Error logging in. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        BruinWatch
      </motion.h1>
      
      <img src={logo} alt="Logo" className="logo" />

      <motion.div className="form-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />                     
          <button 
            type="submit" 
            className="submit-button"
          >
            Login
          </button>
        </form>

        {/* Add Register Button Below */}
        <button 
          onClick={() => navigate("/register")} 
          className="register-button"
        >
          Don't have an account? Register here
        </button>

        </motion.div>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </motion.div>
    </div>
  );
}