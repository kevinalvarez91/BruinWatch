// npm install to install everything

// loading in environment variables and set them into our process.env
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Requires for each library that we installed
// ============================================================================================================================================
// set up our basic express application
const express = require('express')

// we also need to be able to hash our users password
const bcrypt = require('bcrypt')

const passport = require('passport')

// require function then call it
const initializePassport = require('./passport-config')

const flash = require('express-flash')
const session = require('express-session')

const methodOverride = require('method-override')

const cors = require("cors")
// ============================================================================================================================================

// get app variable from express
const app = express()
const PORT = 5001;

// calling this function inside passport-config
// function for finding the user based on their email
initializePassport(
    // passport that we are configuring
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// this is where you would use a data base to store the users
const users = []

app.use(express.json())
app.use(cors({ origin: "http://localhost:5173", credentials: true }))

app.use(session({
    // key that will encrypt all of our information for us
    secret: process.env.SESSION_SECRET,
    resave: false, // should we resave our session variables if nothing has changed
    saveUninitialized: false // do you want to save an empty value in this session if there is no value
}))

// function inside passport
app.use(passport.initialize())
app.use(passport.session()) // lets us store our variables to be persisted across the entire session our user has
// app.use(methodOverride('_method')) 

// first thing we need to do is set up a route
app.get('/', checkAuthenticated, (req, res) => {
    res.json({ message: "Welcome to BruinWatch!" })
})

// need to create routes for both of the new files "login.ejs" and "register.ejs"
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.json({ message: "Not authenticated", user: null })
})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ message: "Server error. Please try again." });
      if (!user) return res.status(401).json({ message: info.message }); // ✅ Send specific error message
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed. Please try again." });
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });
  

// Entire application for registering users
// ==============================================================================================================================================
// we are going to post to a route with the name /register inside of our server
app.post('/register', checkNotAuthenticated, async (req, res) => { // async makes a function return a promise implicitly
    const { email, password } = req.body;
  
    if (users.find((user) => user.email === email)) {
      return res.status(400).json({ message: "Email already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: users.length + 1, email, password: hashedPassword });
  
    res.json({ message: "User registered successfully!" });

    console.log(users)
})
// ==============================================================================================================================================

// Logout Route (Only accessible if logged in)
app.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
  
      req.session.destroy((err) => {  // Ensure session is fully cleared
        if (err) return res.status(500).json({ message: "Session destruction failed" });
  
        res.clearCookie("connect.sid");  // Clear session cookie
        res.json({ message: "Logged out successfully" });
      });
    });
  });
  

// Protected Home Route (Only accessible if logged in)
app.get("/home", checkAuthenticated, (req, res) => {
    res.json({ user: req.user });
  });

  app.get("/auth-status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.status(401).json({ authenticated: false }); // ✅ Ensure proper 401 Unauthorized response
    }
  });
  
// we don't want to allow non-logged-in users to access any information
// this will protect all of our different routes for when we aren't logged in
//                      request, response, next
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.status(401).json({ message: "Unauthorized - Please log in "})
}

// we want to make sure that no user is logged in if we want to access these routes
// next, once a user is logged in, we don't want them to be able to go back to the log in page
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.status(403).json({ message: "Already logged in" })
    }
    next() // if they are not authenticated we want to continue on with the call
}

 // Start Server
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));