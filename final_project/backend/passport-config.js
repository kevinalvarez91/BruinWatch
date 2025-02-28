// to use that local version of passport
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// set up passport to be working with our login 
// passport related information
// now we can do all of our configuration for passport inside of this single file
function initialize (passport, getUserByEmail, getUserByID) {
    // this is what we are going to call from our login using our email and password to make sure our user is correct
    const authenticateUser = async (email, password, done) => {
        // this will return us the user by email or return null if there is no email for this user
        const user = getUserByEmail(email)
        if (!user) return done(null, false, { message: "Email not found" });
        
        // if the user gets to this point that means that there is a user and now we want to authenticate their password using bcrypt
        try {
            /*                (password from page, actual password we are checking) */
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: "Incorrect Password" })
            }
            // catching the error
        } catch(e) {
            return done(e)
        }
    }
    //               don't need to add password because it defaults to using the name "password" already
    passport.use(new LocalStrategy({ usernameField: 'email' /*, <password> */}, authenticateUser)) // function used to authenticate user
    // this will serialize our user to store inside our session
    passport.serializeUser((user, done) => done(null, user.id))
    // deserializing user
    passport.deserializeUser((id, done) => { 
        return done(null, getUserByID(id))
    })
}

// so that we can call this function by requiring our passport config
module.exports = initialize