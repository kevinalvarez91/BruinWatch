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
const session = require('express-session');
const cors = require("cors");

// Additional requires for SQLite and file uploads
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');

const app = express();
const PORT = 5001;

// const users = [];

initializePassport(
  passport, 
  getUserByEmail,
  getUserByID
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
//Database for the comment section 
incidentDb.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,  -- Store the user's email
  user_name TEXT NOT NULL,  -- Store the username
  user_profile TEXT,  -- Store user profile image URL
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  parent_comment_id INTEGER DEFAULT NULL, -- Allows replies
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
//to keep track of each users reaction to comments 
incidentDb.run(`CREATE TABLE IF NOT EXISTS comment_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  reaction_type TEXT CHECK(reaction_type IN ('like', 'dislike')) NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_email)
)`);

//to keep track of users votes on incident status's
incidentDb.run(`CREATE TABLE IF NOT EXISTS user_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'resolved')) NOT NULL,
  voted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(incident_id, user_email)
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

//fetch comments for an incident 
app.get('/incident/:id/comments',(req,res)=>{
  const { id } = req.params;
  const { userEmail } = req.query; // Optional user email for personalized results
  
  let sql;
  let params;
  
  if (userEmail) {
    // Include the user's reactions to each comment
    sql = `SELECT c.*, 
           (SELECT reaction_type FROM comment_reactions 
            WHERE comment_id = c.id AND user_email = ?) AS user_reaction
           FROM comments c 
           WHERE c.incident_id = ? 
           ORDER BY c.created_at DESC`;
    params = [userEmail, id];
  } else {
    // Simple query without user reactions
    sql = `SELECT * FROM comments WHERE incident_id = ? ORDER BY created_at DESC`;
    params = [id];
  }
  incidentDb.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error retrieving comments" });
    }
    res.json(rows);
});
});
//action for posting a new comment 
app.post('/incident/:id/comment', (req, res) => {
  const { id } = req.params;
  const { user_email, user_name, user_profile, text, parent_comment_id } = req.body;

  // Debugging: Log received comment data
  console.log("🛠️ Received comment data:", req.body);

  if (!user_email || !user_name || !text) {
    console.error("Missing required fields:", { user_email, user_name, text });
    return res.status(400).json({ message: "Missing required fields." });
  }

  const sql = `INSERT INTO comments (incident_id, user_email, user_name, user_profile, text, parent_comment_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`;

  incidentDb.run(sql, [id, user_email, user_name, user_profile, text, parent_comment_id || null], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to post comment" });
    }
    res.json({ message: "Comment added", commentId: this.lastID });
  });
});
//now to like and dislike comments and doing one OR the other 
app.post('/comment/:commentId/react', (req, res) => {
  const { commentId } = req.params;
  const { type,userEmail } = req.body; // "like" or "dislike"
  //checking for user email 
  if(!userEmail){
    return res.status(400).json({message: "User email is required"});
  }
  //checking to see if it a valid reaction
  if(!["like","dislike"].includes(type)){
    return res.status(400).json({message: "Invalid reaction type"});
  }
  //now we want to check to see if the user has already like or disliked this comment
  const checkSql = `SELECT reaction_type FROM comment_reactions
                    WHERE comment_id = ? AND user_email = ?`;
  incidentDb.get(checkSql, [commentId,userEmail],(err,existingReaction)=>{
    if(err){
      console.error("Database error:",err);
      return res.status(500).json({message:"failed to check existing reaction"});
    }
    //handling reaction with respect to what already exists 
    if (!existingReaction) {
      //no existing reaction so add a new one
      handleNewReaction(commentId, userEmail, type, res);
    } else if (existingReaction.reaction_type === type) {
      //same reaction type so we remove it
      handleRemoveReaction(commentId, userEmail, type, res);
    } else {
      //different reaction type so we toggle them and vice versa 
      handleSwitchReaction(commentId, userEmail, type, res);
    }
  });
});
//now all the helper functions needed 
//handle new reaction
function handleNewReaction(commentId, userEmail, type, res) {
  //beginning the transaction
  incidentDb.run('BEGIN TRANSACTION', function(err) {
    if (err) {
      console.error("Transaction begin error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    //adding the reaction to comment_reactions
    const insertSql = `INSERT INTO comment_reactions (comment_id, user_email, reaction_type, created_at)
                      VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
    
    incidentDb.run(insertSql, [commentId, userEmail, type], function(err) {
      if (err) {
        incidentDb.run('ROLLBACK');
        console.error("Insert reaction error:", err);
        return res.status(500).json({ message: "Failed to add reaction" });
      }
      
      //Updating the comment counts by one 
      const column = type === "like" ? "likes" : "dislikes";
      const updateSql = `UPDATE comments SET ${column} = ${column} + 1 WHERE id = ?`;
      
      incidentDb.run(updateSql, [commentId], function(err) {
        if (err) {
          incidentDb.run('ROLLBACK');
          console.error("Update counts error:", err);
          return res.status(500).json({ message: "Failed to update counts" });
        }
        
        //commiting the transaction
        incidentDb.run('COMMIT', function(err) {
          if (err) {
            incidentDb.run('ROLLBACK');
            console.error("Commit error:", err);
            return res.status(500).json({ message: "Database error" });
          }
          
          res.json({ 
            message: `${type} added`, 
            action: 'added',
            type: type
          });
        });
      });
    });
  });
}
//helper function to remove an exisiting comment reaction
function handleRemoveReaction(commentId, userEmail, type, res) {
  //beginning the transaction
  incidentDb.run('BEGIN TRANSACTION', function(err) {
    if (err) {
      console.error("Transaction begin error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    // deleting the reactio from comments 
    const deleteSql = `DELETE FROM comment_reactions 
                     WHERE comment_id = ? AND user_email = ?`;
    
    incidentDb.run(deleteSql, [commentId, userEmail], function(err) {
      if (err) {
        incidentDb.run('ROLLBACK');
        console.error("Delete reaction error:", err);
        return res.status(500).json({ message: "Failed to remove reaction" });
      }
      
      // 2.Updating the comment count 
      const column = type === "like" ? "likes" : "dislikes";
      const updateSql = `UPDATE comments SET ${column} = ${column} - 1 WHERE id = ?`;
      //erroro checking
      incidentDb.run(updateSql, [commentId], function(err) {
        if (err) {
          incidentDb.run('ROLLBACK');
          console.error("Update counts error:", err);
          return res.status(500).json({ message: "Failed to update counts" });
        }
        
        //now we commiti the transaction
        incidentDb.run('COMMIT', function(err) {
          if (err) {
            incidentDb.run('ROLLBACK');
            console.error("Commit error:", err);
            return res.status(500).json({ message: "Database error" });
          }
          
          res.json({ 
            message: `${type} removed`, 
            action: 'removed',
            type: type
          });
        });
      });
    });
  });
}
//helper functon to switch between reactions 
function handleSwitchReaction(commentId, userEmail, newType, res) {
  const oldType = newType === 'like' ? 'dislike' : 'like';
  
  //beginning the transaction
  incidentDb.run('BEGIN TRANSACTION', function(err) {
    if (err) {
      console.error("Transaction begin error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    //updating the reaction type in comment_reactions 
    const updateReactionSql = `UPDATE comment_reactions 
                             SET reaction_type = ?, created_at = CURRENT_TIMESTAMP
                             WHERE comment_id = ? AND user_email = ?`;
    
    incidentDb.run(updateReactionSql, [newType, commentId, userEmail], function(err) {
      if (err) {
        incidentDb.run('ROLLBACK');
        console.error("Update reaction error:", err);
        return res.status(500).json({ message: "Failed to update reaction" });
      }
      
      // updating the comment count, incrementing the new one and decrementing the old one
      const updateCountsSql = `UPDATE comments 
                             SET ${oldType}s = ${oldType}s - 1,
                                 ${newType}s = ${newType}s + 1
                             WHERE id = ?`;
      
      incidentDb.run(updateCountsSql, [commentId], function(err) {
        if (err) {
          incidentDb.run('ROLLBACK');
          console.error("Update counts error:", err);
          return res.status(500).json({ message: "Failed to update counts" });
        }
        
        //commiting the transaction
        incidentDb.run('COMMIT', function(err) {
          if (err) {
            incidentDb.run('ROLLBACK');
            console.error("Commit error:", err);
            return res.status(500).json({ message: "Database error" });
          }
          
          res.json({ 
            message: `Switched from ${oldType} to ${newType}`, 
            action: 'switched',
            type: newType,
            oldType: oldType
          });
        });
      });
    });
  });
}

//end of comment section 
//app.use and get API for the resolved feature 
//this is to keep track of the user votes
//chnaged this to only allow the user one vote per incident 
app.post('/incident/:id/vote', (req, res) => {
  const { id } = req.params;
  const { status, userEmail } = req.body; //grabs active or resolved the user_email
  
  if (!userEmail) {
    return res.status(400).json({ message: "User email is required" });
  }

  if (!["active", "resolved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  //then we check if user ha already voted on this incident 
  const checkSql = `SELECT id, status FROM user_votes 
                  WHERE incident_id = ? AND user_email = ?`;
  
  incidentDb.get(checkSql, [id, userEmail], (err, existingVote) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to check existing votes" });
    }
    
    if (existingVote) {
      // if they already voted then me output a message
      return res.status(400).json({ 
        message: "You have already voted on this incident", 
        currentVote: existingVote.status 
      });
    }
    
    //then we begin the transaction 
    incidentDb.run('BEGIN TRANSACTION', function(err) {
      if (err) {
        console.error("Transaction begin error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      
      //we record the users vote
      const insertUserVoteSql = `INSERT INTO user_votes (incident_id, user_email, status, voted_at) 
                               VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
      
      incidentDb.run(insertUserVoteSql, [id, userEmail, status], function(err) {
        if (err) {
          incidentDb.run('ROLLBACK');
          console.error("Insert user vote error:", err);
          return res.status(500).json({ message: "Failed to record user vote" });
        }
        
        //record them in the table 
        const insertVoteSql = `INSERT INTO votes (incident_id, status, voted_at) 
                             VALUES (?, ?, CURRENT_TIMESTAMP)`;
        //inserting them in 
        incidentDb.run(insertVoteSql, [id, status], function(err) {
          if (err) {
            incidentDb.run('ROLLBACK');
            console.error("Insert vote error:", err);
            return res.status(500).json({ message: "Failed to record vote" });
          }
          
          //commit the transaction 
          incidentDb.run('COMMIT', function(err) {
            if (err) {
              incidentDb.run('ROLLBACK');
              console.error("Commit error:", err);
              return res.status(500).json({ message: "Database error" });
            }
            
            res.json({ 
              message: "Vote recorded successfully", 
              voteId: this.lastID,
              status: status 
            });
          });
        });
      });
    });
  });
});
//adding an enpoint to check the user's vote on an incident 
app.get('/incident/:id/user-vote', (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.query;
  
  if (!userEmail) {
    return res.status(400).json({ message: "User email is required" });
  }
  
  const sql = `SELECT status FROM user_votes 
              WHERE incident_id = ? AND user_email = ?`;
  
  incidentDb.get(sql, [id, userEmail], (err, vote) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error retrieving user vote" });
    }
    
    res.json({ 
      hasVoted: !!vote,
      vote: vote ? vote.status : null
    });
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

// Payton's database
// ==================================================================
const loginDb = new sqlite3.Database('loginSystem.db', (err) => {
  if (err) {
    console.error("Could not open loginSystem.db", err);
  } else {
    console.log("Connected to the loginSystem database.");
  }
});

// create users table with desired fields
loginDb.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    association TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Error creating users table:", err);
  } else {
    console.log("Users table is ready.");

    // Query and print all records from the users table
    loginDb.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        console.error("Error retrieving users:", err);
      } else {
        console.log("Current users in login database:", rows);
      }
    });
  }
});

// Define functions to get a user by email and by ID using the loginDb
function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    loginDb.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getUserByID(id) {
  return new Promise((resolve, reject) => {
    loginDb.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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
  const { name, age, association, email, phone, password } = req.body;

  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)?ucla\.edu$/
  // Validate the email using the regex
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email must be a UCLA email ending in .ucla.edu or ucla.edu" });
  }
  
  // 1. Log the incoming data (hide the raw password for security)
  console.log("\nNew registered user info:", {
    name,
    age,
    association,
    phone,
    email,
    password: "Classified" // Don't log the real password
  });

  // Check if a user with the given email already exists
  loginDb.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (row) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      loginDb.run(
        "INSERT INTO users (name, age, association, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)",
        [name, age, association, email, phone, hashedPassword],
        function(err) {
          if (err) {
            console.error("Registration error:", err);
            return res.status(500).json({ message: "User registration failed" });
          }
          res.json({ message: "User registered successfully!", userId: this.lastID });
        }
      );
    } catch (e) {
      console.error("Hashing error:", e);
      res.status(500).json({ message: "Error processing registration" });
    }
  });
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

// New GET endpoint to fetch statistics with adjusted KPI logic
app.get('/stats', (req, res) => {
  // First, get total incidents from the incidents table.
  console.log("GET /stats endpoint hit"); // For debugging
  incidentDb.get("SELECT COUNT(*) AS totalIncidents FROM incidents", [], (err, totalRow) => {
    if (err) {
      console.error("Error fetching total incidents:", err);
      return res.status(500).json({ message: "Error retrieving total incidents" });
    }
    const totalIncidents = totalRow.totalIncidents;

    // Next, count the number of incidents that have at least one "resolved" vote.
    incidentDb.get(
      "SELECT COUNT(DISTINCT incident_id) AS resolvedIssues FROM user_votes WHERE status = 'resolved'",
      [],
      (err, resolvedRow) => {
        if (err) {
          console.error("Error fetching resolved issues:", err);
          return res.status(500).json({ message: "Error retrieving resolved issues" });
        }
        const resolvedIssues = resolvedRow.resolvedIssues;
        // Consider any incident not resolved as active.
        const activeReports = totalIncidents - resolvedIssues;

        res.json({ totalIncidents, activeReports, resolvedIssues });
      }
    );
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

app.get("/auth-status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
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

//This is for profile
app.get('/api/user', checkAuthenticated, (req, res) => {
  console.log("User object: ", req.user);
  const userEmail = req.user.email; // Assuming the user's email is stored in req.user

  loginDb.get("SELECT name, age, association, email, phone FROM users WHERE email = ?", [userEmail], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Error retrieving user data" });
    }
    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data
    res.json({
      name: row.name,
      profilePic: "NULL", // Placeholder for profile picture
      about: "About me placeholder", // Placeholder for "About Me"
      contact: {
        email: row.email,
        phone: row.phone || "No phone number provided"
      },
      interests: ["Drawing", "Coding"], // Placeholder for interests
      age: row.age || 0,
      association: row.association || "Fail",
      trustRating: 4.5 // Placeholder for trust rating
    });
  });
});

function checkNotAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return res.status(403).json({ message: "Already logged in" });
  }
  next();
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
