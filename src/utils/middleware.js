const { Campground, campgroundValidator } = require('../models/campground') // import campground model
const { Review, reviewValidator } = require('../models/review') // import review model
const { ExpressError, catchAsync } = require('./errors'); // home made error handling middleware and class

const isLoggedIn = (req, res, next) => { // middleware to check if user is logged in
  console.log("req.user", req.user) // req.user is a passport property added to the request object
  console.log("req.isAuthenticated()", req.isAuthenticated()) // req.isAuthenticated() is a passport method added to the request object
  console.log("req.path", req.path) // req.path is a property added to the request object by express, referring to the route path that matches the request
  console.log("req.originalUrl", req.originalUrl) // req.originalUrl is a property added to the request object by express, referring to the original URL of the request
  console.log("req.session", req.session) // req.originalUrl is a property added to the request object by express, referring to the original URL of the request
  // store the url the user is trying to access in the session object
  // if (!req.isAuthenticated()) { // if user is not logged in. OLD version, now replaced by passport
  if (!req.isAuthenticated()) { // if user is not logged in (passport version)
    req.session.returnTo = req.originalUrl; // req.originalUrl is a property added to the request object by express. ReturnTo is a  (newly created) property added to the session object by express-session
    req.flash('error', 'Please sign in first to access this page !'); // flash message
    return res.redirect("/users/login") // redirect to login page
  }
  return next() // if user is logged in, continue to the next middleware
}

const isAuthor = async (req, res, next) => { // middleware to check if user is the author of the campground
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash('error', ' Campground not found ') // remember to use req.flash() and not res.flash()
    return res.redirect('/campgrounds')
  }
  if (!campground.author.equals(req.user._id)) { // if user is not the author of the campground
    req.flash('error', 'You are not authorized to do that !'); // flash message
    return res.redirect(`/campgrounds/${id}`) // redirect to campground page
  } 
  return next() // if user is the author of the campground, continue to the next middleware
}

const isCampgroundReviewAuthor = async (req, res, next) => { // middleware to check if user is the author of the campground
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review) {
    req.flash('error', ' Review not found ') // remember to use req.flash() and not res.flash()
    return res.redirect(`/campgrounds/${id}`)
  }
  if (!review.author.equals(req.user._id)) { // if user is not the author of the review
    req.flash('error', 'You are not authorized to do that !'); // flash message
    return res.redirect(`/campgrounds/${id}`) // redirect to campground page
  } 
  return next() // if user is the author of the campground, continue to the next middleware
}

const isReviewAuthor = async (req, res, next) => { // middleware to check if user is the author of the campground
  const { id } = req.params
  const review = await Review.findById(id)
  if (!review) {
    req.flash('error', ' Review not found ') // remember to use req.flash() and not res.flash()
    return res.redirect(`/reviews`)
  }
  if (!review.author.equals(req.user._id)) { // if user is not the author of the review
    req.flash('error', 'You are not authorized to do that !'); // flash message
    return res.redirect(`/reviews`) // redirect to campground page
  } 
  return next() // if user is the author of the campground, continue to the next middleware
}

const validateCampground = (req, res, next) => { // middleware to validate the campground
  console.log("• CALLED validateCampground middleware for: ", req.body)
  const { error } = campgroundValidator.validate(req.body)
  console.log("• error: ", error)
  if (error) {
    // const msg = '▲ ' + result.error.details.map(el => el.message).join(' → ')
    console.log("▼ validateCampground error:", error.details)
    const msg = "▼ validateCampground error: " + error.details.map(el => el.message).join(' → ')
    throw new ExpressError(400, msg)
  } 
  else { 
    console.log("• calling next() from: validateCampground")
    next()
  }
}

const validateReview = (req, res, next) => { // middleware to validate the review
  const result = reviewValidator.validate(req.body)
  console.log("• reviewValidator Joi result:", result)
  if (result.error) {
  // const msg = '▲ ' + result.error.details.map(el => el.message).join(' → ')
  console.log("• reviewValidator Joi Details:", result.error.details)
  const msg = '▲ Error Joi reviewValidator ' + result.error.details.map(el => el.message).join(' → ')
  throw new ExpressError(msg,400)
  } 
  else { 
    console.log("calling next() from: validateReview")
    next()
  }
}

module.exports = { validateCampground, validateReview, isLoggedIn, isAuthor , isReviewAuthor, isCampgroundReviewAuthor}