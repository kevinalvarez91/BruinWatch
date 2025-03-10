import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [association, setAssociation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear any previous messages

    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          age, 
          association, 
          email, 
          phone, 
          password 
        }),
        credentials: "include", // Sends cookies for sessions
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        setMessage(data.message);
        navigate("/login");
      } else {
        // Registration failed
        setMessage(data.message || "User registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("User registration failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", width: "300px" }}>
        
        {/* Name Field */}
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Age Field */}
        <label>Age:</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />

        {/* Association Field (Select) */}
        <label>Association:</label>
        <select 
          value={association}
          onChange={(e) => setAssociation(e.target.value)}
          required
        >
          <option value="">--Select--</option>
          <option value="undergrad">Undergraduate</option>
          <option value="postgrad">Postgraduate</option>
          <option value="faculty">Faculty</option>
        </select>

        {/* Phone Field */}
        <label>Phone:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        {/* Email Field */}
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field */}
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={{ marginTop: "1rem" }}>
          Register
        </button>
      </form>

      {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}