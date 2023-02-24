
if ( process.env.NODE_ENV !== "production" ) { // if the environment is not production, load the .env file
  require('dotenv').config(); // load the .env file
  // console.log(process.env.CLOUDINARY_CLOUD_NAME)
  // console.log(process.env.CLOUDINARY_KEY)
  // console.log(process.env.CLOUDINARY_SECRET)
}

// IMPORT MODULES

const express = require('express')
const path = require('path')
const mongoose = require('mongoose') // working with MongoDB
const ejsMate  = require('ejs-mate')
const session = require('express-session') // session management
const flash = require('connect-flash') // flash messages
const passport = require('passport') // authentication
const LocalStrategy = require('passport-local') // authentication strategy
const methodOverride = require('method-override') // using other verbs than GET and PUT with HTML forms
const mongoSanitize = require('express-mongo-sanitize');  // sanitize data to prevent MongoDB Operator Injection
const helmet = require("helmet");
const MongoStore = require('connect-mongo') // store session in MongoDB

// IMPORT CUSTOM MIDDLEWARES AND CLASSES

const { ExpressError, catchAsync } = require('./utils/errors'); // home made error handling middleware and class

// IMPORT MODELS

const { Review } = require('./models/review'); // import the review model
const { Campground } = require('./models/campground'); // import the campground model
const { User } = require('./models/user'); // import the user model. Again the {} are not needed because we are not exporting an object with multiple properties, but a single class

// SERVER SET UP

const app = express() // create/instantiate an express object


app.set('view engine','ejs') // sets the default engine for EJS files, meaning that you can use res.render('fileName') instead of res.render('fileName', {extension: 'ejs'}).
app.engine('ejs', ejsMate)  // sets EJS-Mate as the engine for EJS files. EJS-Mate requires EJS, but adds functionalities such as boilerplates and layouts
app.set('views', path.join(__dirname, '/views')) // set the default folder for ejs files. use the path.join to merge the path of the current direct(__dirname property) and 'views' folder into an absolute path

app.use(express.static(path.join(__dirname,'public'))) //create an absolute reference to the public folder to make the content of the public folder available to the server. use path.join to create an absolute reference to the public folder

app.use(express.urlencoded({ extended: true })) // To parse incoming URL-encoded requests (form data in POST request body). Important : if you do not do this, you won't be able to get data from a POST request body
app.use(express.json()) // To parse incoming JSON requests. Important : if you do not do this, you won't be able to get data from a POST request body
app.use(methodOverride('_method')) // To parse incoming PUT and DELETE requests, which are normally not allowed in HTML forms. This requires  to use _method in the form action to 'fake' put/patch/delete requests as a POST request


const dbCloud = process.env.MONGODB_URI // my MongoDB Atlas connection string
const dbLocal ='mongodb://127.0.0.1:27017/yelpCamp' // my local MongoDB connection string
const dbUrl = dbLocal // choose the database to use

const store = MongoStore.create({ // store session in MongoDB
  mongoUrl: dbUrl,
  crypto: {
    secret: 'asquirreliseatingnuts'
  },
  touchAfter: 24 * 60 * 60 // time period in seconds after which the session will be updated in the database. In this case, the session will be updated every 24 hours
});

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {  
  store: store, // store session in MongoDB
  name: 'localstore', // name of the session ID cookie. Random string of characters to prevent hackers from guessing the name of the cookie
  secret: "mysecret", // secret is used to sign the session ID cookie
  resave: false, // do not save session if unmodified
  saveUninitialized: true, // set to tru to create a session in all cases. Set to falst to create session only when something is stored
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // cookie expires in 7 days (absolute date)
    maxAge: 1000 * 60 * 60 * 24 * 7, // age is exressed in miliseconds. cookie expires in 7 days (relative date)
    httpOnly: true, // cookie cannot be accessed or modified by the browser
    // secure: true // cookie will only be sent on HTTPS connections. Does not work on localhost !!!
  }
}


app.use(session(sessionConfig)) // use session middleware

mongoose.connect(dbUrl)
  .then((m) => {
    console.log("• MongoDB connection OPEN with Mongoose for yelpCamp")
  })
  .catch((e) => {
    console.log(" ▲ MongoDB connection ERROR with Mongoose for yelpCamp "/* , e */)
  })


app.use(flash()) // use flash middleware

app.use(passport.initialize()) // initialize passport to use it in the app (it will use the session middleware). 
app.use(passport.session()) // use passport session to store the user in the session, this allows the user to stay logged in even if the server is restarted (passport will deserialize the user from the session). This must be used after the session middleware
passport.use(new LocalStrategy(User.authenticate())) // use the local strategy to authenticate users with username and password (User.authenticate() is a passport-local-mongoose method)
passport.serializeUser(User.serializeUser()) // serialize the user to store it in the session  (User.serializeUser() is a passport-local-mongoose method)
passport.deserializeUser(User.deserializeUser()) // deserialize the user from the session

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query


// SECURITY MIDDLEWARES

// To remove data using these defaults:
app.use(mongoSanitize({replaceWith: '_',  }));
// app.use(helmet({contentSecurityPolicy: false})); // helmet is a collection of 14 smaller middleware functions that set HTTP response headers to protect against well-known web vulnerabilities. Content Security Policy is disabled because it prevents the use of inline scripts and styles, which are used in the EJS templates. For now I have disabled this line, as we use the detailed instructions below to set the Content Security Policy

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);


// MIDDLEWARES

app.use((req, res, next) => { // this middleware will be called on every request
  res.locals.success = req.flash('success'); // pass the success flash message to the template
  res.locals.error = req.flash('error'); // pass the error flash message to the template
  res.locals.currentUser = req.user; // pass the current user (from passport) to the template (this is used to display the login/logout button)
  const { passport, flash, returnTo } = req.session;
  // console.log("• Session = ", { passport, flash, returnTo }); // display the session data in the console})
  // console.log("Calling next() in: app.use((req, res, next)")
  next(); // move on to the next middleware
})


// IMPORT ROUTES

const campgroundRoutes = require('./routes/campgrounds') // campgrounds routes
const { reviewRoutes , campgroundReviewRoutes } = require('./routes/reviews') // reviews routes
const userRoutes = require('./routes/users') // user routes
const utilRoutes = require('./routes/utils') // utils routes

// USE ROUTES

app.use('/campgrounds', campgroundRoutes) // add /campgrounds to all routes in campgrounds.js
app.use('/campgrounds/:id/reviews', campgroundReviewRoutes) // add /campgrounds/:id/reviews to all routes in reviews.js using the campgroundReviewRoutes router
app.use('/reviews', reviewRoutes) // add /reviews to all routes in reviews.js using the reviewRoutes router
app.use('/users', userRoutes) // add /users to all routes in reviews.js
app.use('/utils', utilRoutes) // add /campgrounds/:id/reviews to all routes in reviews.js

// OTHER ROUTES

app.get('/', (req,res) => {
  console.log('• Hello from YelpCamp Home')
  res.cookie('name', 'Fabrizio') // set a cookie. note that cookie is a function of the response object, so I use () instead of = {}
  res.render('home', { session : req.session })
})

// Teacher - this works.
app.all('*', (req, res, next) => {
  next(new ExpressError('▼ Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('utils/error', { err })
})

// this is the final app.use, so it will catch any error that was not caught before
app.use( (err, req, res, next) => {
  console.log("▼ Final app.use error handling middleware on console - before ")
  const {statusCode = 500 } = err
  if (!err.message) err.message = "▲ Final app.use - Something went wrong "
  // note that status will only appear on the client console, while message will be sent to the browser
  // use this to send a HTML message
  // res.status(statusCode).send(message)
  // or use this to send render a page. User {err} to destructure and send the error message to the page
  // and this message will apear on the server console
  console.log("▼ Final app.use error handling middleware on console - after ", err)
})

// SERVER

app.listen(3000, () => {
  console.log("• Serving yelpCamp on localhost:3000")
})


