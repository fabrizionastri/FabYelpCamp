const express = require('express')
const path = require('path')
const mongoose = require('mongoose') // working with MongoDB
const ejsMate  = require('ejs-mate')
const session = require('express-session') // session management
const flash = require('connect-flash') // flash messages

const catchAsync = require('./utils/catchAsync') // home made Error hangling middleware
const ExpressError = require('./utils/ExpressError') // home made Error class
const methodOverride = require('method-override') // using other verbs than GET and PUT with HTML forms

const campgrounds = require('./routes/campgrounds') // campgrounds routes
const reviews = require('./routes/reviews') // reviews routes
const { Review } = require('./models/review'); // import the review model
const { Campground } = require('./models/campground'); // import the campground model

const sessionOptions = {  
  secret: "mysecret", // secret is used to sign the session ID cookie
  resave: false, // do not save session if unmodified
  saveUninitialized: true, // set to tru to create a session in all cases. Set to falst to create session only when something is stored
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // cookie expires in 7 days (absolute date)
    maxAge: 1000 * 60 * 60 * 24 * 7, // cookie expires in 7 days (relative date)
    httpOnly: true, // cookie cannot be accessed or modified by the browser
    // secure: true // cookie will only be sent on HTTPS connections. Does not work on localhost !!!
}}

// SERVER SET UP

const app = express() // create/instantiate an express object

app.engine('ejs', ejsMate) // sets the default engine for EJS files, meaning that you can use res.render('fileName') instead of res.render('fileName', {extension: 'ejs'}).
app.set('view engine','ejs') // sets EJS-Mate as the engine for EJS files. EJS-Mate requires EJS, but adds functionalities such as boilerplates and layouts
app.set('views', path.join(__dirname, '/views')) // set the default folder for ejs files. use the path.join to merge the path of the current direct(__dirname property) and 'views' folder into an absolute path

app.use(express.static(path.join(__dirname,'public'))) //create an absolute reference to the public folder to make the content of the public folder available to the server. use path.join to create an absolute reference to the public folder
app.use(express.urlencoded({ extended: true })) // To parse incoming URL-encoded requests (form data in POST request body). Important : if you do not do this, you won't be able to get data from a POST request body
app.use(express.json()) // To parse incoming JSON requests. Important : if you do not do this, you won't be able to get data from a POST request body
app.use(methodOverride('_method')) // To parse incoming PUT and DELETE requests, which are normally not allowed in HTML forms. This requires  to use _method in the form action to 'fake' put/patch/delete requests as a POST request

app.use(session(sessionOptions)) // use session middleware
app.use(flash()) // use flash middleware

// MIDDLEWARES

/* app.use((req, res, next) => { // a middleware to pass the flash message to the template
  // pass the success and/or failure flash messages to all the templates
  // you can flash under any key, but I'm using 'success' and 'error' to be consistent with the bootstrap classes
  res.locals.success = req.flash('success'); // pass the success flash message to the template
  res.locals.error = req.flash('error'); // pass the error flash message to the template
  console.log("Calling next() in: app.use((req, res, next)")
  next(); // move on to the next middleware
}) */


// IMPORT ROUTES

app.use('/campgrounds', campgrounds) // add /campgrounds to all routes in campgrounds.js
app.use('/campgrounds/:id/reviews', reviews) // add /campgrounds/:id/reviews to all routes in reviews.js

// OTHER ROUTES



app.get('/check-image', async (req,res) => {
  console.log("• Got a new check-image GET request via Express")
  res.render('checkImage')
})

app.get('/chicken', catchAsync(async (req,res) => { // a route to test error handling
  console.log("▼ Post an error message to the console - chicken.fly before  ▲ ")
  chicken.fly() // this will throw an error because the function fly() does not exist
  console.log("▼ Post an error message to the console - chicken.fly after  ▲ ")
}))

app.get("/reviews", catchAsync(async (req,res) => { // a route to all reviews and check if they are associated to a campground
  const reviews = await Review.find({})
  for (let review of reviews) {
    // find the campground who includes the id of this review in its reviews array
    const campground = await Campground.findOne({reviews: review.id})
    // if the campground is found, add the campground name to the review object
    if (campground) {
      review.campgroundTitle = campground.title
      review.campgroundId = campground.id
    }
  }
  res.render("reviews", {reviews})
}))

app.get("/reviews/:id/delete", catchAsync(async (req,res) => { // a route to delete a review
  const {id} = req.params
  await Review.findByIdAndDelete(id)
  req.flash('success', 'Review deleted successfully')
  res.redirect("/reviews")
}))

app.get('/', (req,res) => {
  console.log('Hello from YelpCamp Home')
  res.cookie('name', 'Fabrizio') // set a cookie. note that cookie is a function of the response object, so I use () instead of = {}
  res.render('home')
})

// ERROR HANDLING

app.all("*", (req, res, next) => {
  // res.send('<h1>404 !!!</h1>')
  // I'm using next to pass this error to the next app.use (final one below)
  // In theory, you could use only throw new ExpressError, but we don't know beforehand if all the errors caught by app.all() will be synchronous. If at least one of them is asynchronous, then it wouldn't be caught, as Express does not handle asynchronous errors by default, we need to use next() to do so. Therefore, to cover all cases, next() is a more appropriate approach.
  console.log("Calling next() in: app.all('*')")
  next(new ExpressError("▼ Page not found (invalid URL)", 404))
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
  res.status(statusCode).render("error", {err})
  // and this message will apear on the server console
  console.log("▼ Final app.use error handling middleware on console - after ", err)
})

// SERVER

app.listen(3000, () => {
  console.log("• Serving yelpCamp on localhost:3000")
})

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
  .then((m) => {
    console.log("• MongoDB connection OPEN with Mongoose for yelpCamp")
  })
  .catch((e) => {
    console.log(" ▲ MongoDB connection ERROR with Mongoose for yelpCamp "/* , e */)
  })

