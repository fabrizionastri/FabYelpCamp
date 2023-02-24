const express = require('express');
const campRouter = express.Router({ mergeParams: true }); // router for for campgrounds/:id/reviews routesmergeParams: true is needed to access the id of the parent route (campground) in the child route (review)
const router = express.Router(); // router for for /reviews routes

const { catchAsync } = require('../utils/errors'); // home made error handling middleware and class
const { validateReview, isLoggedIn, isReviewAuthor, isCampgroundReviewAuthor } = require('../utils/middleware'); // import middleware

const reviews = require('../controllers/reviews')

// ROUTES

campRouter.post("/addreview", isLoggedIn, validateReview, catchAsync(reviews.addreview))

campRouter.delete("/:reviewId", isLoggedIn, isCampgroundReviewAuthor, catchAsync(reviews.deleteFromCampground))

router.get("/:id/delete", isLoggedIn, isReviewAuthor, catchAsync(reviews.delete))

router.get("/", catchAsync(reviews.index))

module.exports = { reviewRoutes : router , campgroundReviewRoutes : campRouter }

