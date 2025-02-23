import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from '../assets/bear_with_glasses.jpg';
import '../css/LoginPage.css'

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "1" && password === "1") {
      navigate("/home");
    } else {
      setMessage("Invalid credentials. Try again.");
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
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        </motion.div>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </motion.div>
    </div>
  );
}