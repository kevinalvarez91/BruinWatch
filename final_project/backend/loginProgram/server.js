// THINGS YOU NEED TO INSTALL
// package.json is where we store all of our dependencies
// Dependencies needed to get the basic application running
// 1.  npm init

// (2-4 ran on the same line)
// 2.  npm i                         allows you to start installing dependencies (used for all dependency installs)
// 3.  express                       application server
// 4.  ejs                           templating language for all of our different views such as login, register, etc.

// (5-7 ran on same line)
// 5.  npm i --save-dev              devlopment only
// 6.  nodemon                       allows us to restart our server automatically every time we make changed
// 7.  dotenv                        allows us to have environment variables that we can store on a .env file that we can load on our server
// 8.  npm run devStart              runs devStart script

// 9.  npm i bcrypt                  allows us to hash passwords and compare hashed passwords to make sure that our application is secure

// 10. npm i passport                has a bunch of different ways to login (facebook, google, local password, email, etc.)
// 11. passport-local                local version allows us to use usernames and passwords for logging in
// 12. express-session               stores and persists our user across different pages
// 13. express-flash                 to display messages for if we fail to login (used by passport inside the internals to display messages for wrong email, password, etc.)

// 14. npm i method-override         allows us to override our method (post) so that we can call the delete method at the bottom

// loading in environment variables and set them into our process.env
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Requires for each library that we installed (i think)
// ============================================================================================================================================
// set up our basic express application
const express = require('express')

// get app variable from express
const app = express()

// we also need to be able to hash our users password
const bcrypt = require('bcrypt')

const passport = require('passport')

// require function then call it
const initializePassport = require('./passport-config')

const flash = require('express-flash')
const session = require('express-session')

const methodOverride = require('method-override')
// ============================================================================================================================================

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

// need to tell our server that we are using ejs
app.set('view engine', 'ejs')

// telling application that we want to take these forms from our email and our password
// and we want to be able to access them inside our request variable inside of our post method
app.use(express.urlencoded({ extended: false }))

// now we need a bunch of use statements so that our server knows how to use passport
app.use(flash())
app.use(session({
    // key that will encrypt all of our information for us
    secret: process.env.SESSION_SECRET,
    resave: false, // should we resave our session variables if nothing has changed
    saveUninitialized: false // do you want to save an empty value in this session if there is no value
}))
// function inside passport
app.use(passport.initialize())
app.use(passport.session()) // lets us store our variables to be persisted across the entire session our user has
app.use(methodOverride('_method'))

// first thing we need to do is set up a route
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

// need to create routes for both of the new files "login.ejs" and "register.ejs"
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',        // if there is a success, which goes to home page
    failureRedirect: '/login',   // if there is a failure we want to redirect them back to the login
    failureFlash: true           // allows us to display a flash message
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// Entire application for registering users
// ==============================================================================================================================================
// we are going to post to a route with the name /register inside of our server
app.post('/register', checkNotAuthenticated, async (req, res) => { // async makes a function return a promise implicitly
    // examples of async?
    // 1. hashing passwords (bcrypt)
    // 2. saving user to a database (mongoDB, MySQL)
    // 3. sending an email confirmation
    // 4. checking if the user already exists in the database
    // These operations don't complete instantly and usually return a promise. This means we are able to use await now

    // we now want to use a try catch block because we are using asychronous code
    try {
        // we need await because it's async so it's going to return after waiting for it
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // how many times we want to generate this hash
        // this password is what we would want to store in our db
        users.push({
            id: Date.now().toString(), // if we had a db this would be automatically generated so we wouldn't have to worry about this step
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword // safe to store on db because password is hashed
        })
        // if all of this was successful we want to redirect our user to the login page
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})
// ==============================================================================================================================================

// now we want to be able to log our user out of their account
app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if(err) {
            return next(err);
        }
        res.redirect('/login'); // given to us by passport (clears our session and logs user out)
    });
});

// we don't want to allow non-logged-in users to access any information
// this will protect all of our different routes for when we aren't logged in
//                      request, response, next
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

// we want to make sure that no user is logged in if we want to access these routes
// next, once a user is logged in, we don't want them to be able to go back to the log in page
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/') // redirects to home page
    }
    next() // if they are not authenticated we want to continue on with the call
}

// application running on port 3000
app.listen(3000)