const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams: true is needed to access the id of the parent route (campground) in the child route (review)

const catchAsync = require('../utils/catchAsync'); // import the catchAsync function
const ExpressError = require('../utils/ExpressError'); // import the ExpressError class

const { Campground , campgroundValidator } = require('../models/campground'); // import the campground model
const { Review, reviewValidator } = require('../models/review'); // import the review model

// MIDDLEWARE

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

// ROUTES

router.post("/addreview", validateReview, catchAsync(async (req,res, next) => { // a POST route to add a review to a campground used by the form in the show.ejs template
  console.log("• Received a post request for a new review:", req.body.review)
  const { id } = req.params
  const campground = await Campground.findById(id)
  console.log("• For the target campground with id: ", id)
  console.log(campground)
  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash('success', 'Successfully added a new review!')
  console.log("• New review:", review)
  res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:reviewId", catchAsync(async (req,res) => { // a DELETE route to delete a review
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
}))

module.exports = router;

