const express = require('express');
const campRouter = express.Router({ mergeParams: true }); // router for for campgrounds/:id/reviews routesmergeParams: true is needed to access the id of the parent route (campground) in the child route (review)
const router = express.Router(); // router for for /reviews routes
const flash = require('connect-flash') // flash messages
const session = require('express-session') // session management

const { ExpressError, catchAsync } = require('../utils/errors'); // home made error handling middleware and class
const { Campground , campgroundValidator } = require('../models/campground'); // import the campground model
const { Review, reviewValidator } = require('../models/review'); // import the review model
const { validateCampground, validateReview, isLoggedIn, isAuthor, isReviewAuthor, isCampgroundReviewAuthor } = require('../utils/middleware'); // import middleware

// FUNCTIONS

module.exports.addreview = async (req,res, next) => { // a POST route to add a review to a campground used by the form in the show.ejs template
  console.log("• Received a post request for a new review:", req.body.review)
  const { id } = req.params
  const campground = await Campground.findById(id)
  console.log("• For the target campground with id: ", id)
  console.log(campground)
  const review = new Review(req.body.review)
  review.author = req.user._id
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash('success', 'Successfully added a new review from author!', req.user.username)
  console.log("• New review:", review)
  res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteFromCampground = async (req,res) => { // a DELETE route to delete a review
  // this route causes the review to be deleted from the review collection and the review id to be removed from the campground.reviews array. A confirmation message is send back to the client indicating if the review was deleted or not. If the deletion is sucessful, the message is "Review deleted". If not, the message is "There was a problem, the review was not deleted". The client is responsible for updating the UI
  const { id, reviewId } = req.params
  console.log("• Deleting review:", reviewId, "from campground:", id)
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
  await Review.findByIdAndDelete(reviewId)
    .then((m) => {
      req.flash('success', 'Successfully deleted a review!')
      console.log("• Deleting campground from MongoDB ", m)})
    .catch((e) => {
      req.flash('error', 'Error when attempting to delete a review from the delete review route!')
      console.log("▼ Error when attempting to delete a review from the delete review route! " , e )
    })

  res.redirect(`/campgrounds/${id}`)
}

module.exports.delete = async (req,res) => { // a route to delete a review
  const {id} = req.params
  await Review.findByIdAndDelete(id)
  req.flash('success', 'Review deleted successfully')
  res.redirect("/reviews")
}

module.exports.index = async (req,res) => { // a route to all reviews and check if they are associated to a campground
  console.log("• GET request for reviews index") // req.body.review)
  const reviews = await Review.find({}).populate('author')
  console.log(reviews)
  // res.send("Hello from the reviews route")
  for (let review of reviews) {
    // find the campground which includes the id of this review in its reviews array
    const campground = await Campground.findOne({reviews: review.id})
    // if the campground is found, add the campground name to the review object
    if (campground) {
      review.campgroundTitle = campground.title
      review.campgroundId = campground.id
    }
  }
  res.render("reviews", {reviews})
}
