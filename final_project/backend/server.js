const fs = require('fs');
const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require("cors");

// Additional requires for SQLite and file uploads
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');

const app = express();
const PORT = 5001;

const users = [];
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const incidentDb = new sqlite3.Database('incidentReports.db', (err) => {
  if (err) {
    console.error("Could not open incidentReports.db", err);
  } else {
    console.log("Connected to the incidentReports database.");
  }
});

// Create the incidents table (with coordinates) if it doesn't exist
incidentDb.run(`CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image_path TEXT,
  location TEXT,
  lat REAL,
  lng REAL,
  created_at TEXT NOT NULL
)`);
//adding a database for the resolved feateure 
incidentDb.run(`CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('active', 'resolved')) NOT NULL,
  voted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//app.use and get API for the resolved feature 
//this is to keep track of the user votes
app.post('/incident/:id/vote', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "active" or "resolved"

  if (!["active", "resolved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = `INSERT INTO votes (incident_id, status, voted_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;
  incidentDb.run(sql, [id, status], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database insertion failed" });
    }
    res.json({ message: "Vote recorded", voteId: this.lastID });
  });
});
//fetching the last 5 votes to display them 
app.get('/incident/:id/votes', (req, res) => {
  const { id } = req.params;

  const sql = `SELECT status, voted_at FROM votes WHERE incident_id = ? ORDER BY voted_at DESC LIMIT 5`;
  incidentDb.all(sql, [id], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error retrieving votes" });
    }
    res.json(rows);
  });
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
  res.json({ message: "Welcome to BruinWatch!" });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.json({ message: "Not authenticated", user: null });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server error. Please try again." });
    if (!user) return res.status(401).json({ message: info.message });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed. Please try again." });
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;
  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: users.length + 1, email, password: hashedPassword });
  res.json({ message: "User registered successfully!" });
  console.log(users);
});

// POST route to handle incident report submission (including coordinates)
app.post('/report', upload.single('image'), (req, res) => {
  const { title, description, location, lat, lng } = req.body;
  
  console.log("Received data:", {
    title,
    description,
    location,
    lat: typeof lat === 'string' ? lat : 'undefined',
    lng: typeof lng === 'string' ? lng : 'undefined',
    imageReceived: req.file ? true : false
  });
  
  // Parse lat and lng to ensure they're stored as numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  // Log the parsed values
  console.log("Parsed coordinates:", { 
    latitude: isNaN(latitude) ? 'NaN' : latitude, 
    longitude: isNaN(longitude) ? 'NaN' : longitude 
  });
  
  const imagePath = req.file ? req.file.path : null;
  const createdAt = new Date().toISOString();
  
  // Validate coordinates before inserting
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: "Invalid coordinates provided" });
  }
  
  const sql = `INSERT INTO incidents (title, description, image_path, location, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  incidentDb.run(sql, [title, description, imagePath, location, latitude, longitude, createdAt], function(err) {
    if (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database insertion failed" });
    } else {
      res.json({ 
        message: "Incident report saved", 
        incidentId: this.lastID,
        location: location,
        coordinates: { lat: latitude, lng: longitude }
      });
    }
  });
});

// New GET route to fetch all incident reports
app.get('/reports', (req, res) => {
  const sql = "SELECT * FROM incidents ORDER BY id DESC";
  incidentDb.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving reports" });
    } else {
      res.json(rows);
    }
  });
});

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Session destruction failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

app.get("/home", checkAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
// GET route to fetch a single incident by ID
app.get('/reports/:id', (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM incidents WHERE id = ?";
  incidentDb.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving incident" });
    } else if (!row) {
      res.status(404).json({ message: "Incident not found" });
    } else {
      res.json(row);
    }
  });
});
//handles non accessible files
app.use('/uploads', express.static('uploads'));
function checkAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized - Please log in " });
}

function checkNotAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return res.status(403).json({ message: "Already logged in" });
  }
  next();
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
