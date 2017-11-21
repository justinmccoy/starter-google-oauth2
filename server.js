var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleStrategy({
    clientID: 'xxxx',
    clientSecret: 'xxxx',
    callbackURL: 'https://xxx.mybluemix.net/auth/google/callback',
    passReqToCallback   : true
  },function(request, accessToken, refreshToken, profile, cb) {
    console.log('profile: ' + profile);
    console.log('request: ' + request);
    console.log('accessToken: ' + accessToken);
    //__self.accessToken = accessToken;
    console.log('refreshToken: ' + refreshToken);
    // asynchronous verification, for effect... 
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return cb(null, profile);
    });
}));


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Define routes.
app.get('/', function(req, res) {
    res.render('home', {user: req.user});
});

app.get('/profile', function(req, res){
  if (req.isAuthenticated()) {
    res.render('profile', {user: req.user});
  } else {
    res.redirect('/');
  }
});

app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 
            'https://www.googleapis.com/auth/plus.login', 
            'email', 
            'https://www.googleapis.com/auth/drive'] 
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/', successRedirect: '/profile',}), function(req, res) {
    res.redirect('/profile');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var port = process.env.PORT || 80
app.listen(port, function() {
  console.log("OAUTH2.0 Example App Running");
});


