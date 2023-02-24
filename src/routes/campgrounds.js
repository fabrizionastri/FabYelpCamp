const express = require('express');
const router = express.Router();
const multer = require('multer');

const { storage } = require('../cloudinary'); // import the cloudinary storage object. No need to specify the filename, because we used index.js as the filename, which is the default filename
// const upload = multer({ dest: 'uploads/' }) // to store images locally
const upload = multer({ storage }) // to store images on cloudinary

const { catchAsync } = require('../utils/errors'); // home made error handling middleware and class
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware'); // import the isLoggedIn middleware

const campgrounds = require('../controllers/campgrounds'); // import the campground controller
const { transformAuthInfo } = require('passport');

// ROUTES

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('images', 2), validateCampground, catchAsync(campgrounds.create))

router.route('/new')
  .get(isLoggedIn, catchAsync(campgrounds.renderCreateForm))

router.route("/:id/images/:imageId/delete")
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteImage))

router.route('/:id') 
  .get(catchAsync(campgrounds.show))
  .put(isLoggedIn, upload.array('images', 2), isAuthor, catchAsync(campgrounds.update))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.route("/:id/edit")
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderUpdateForm))

module.exports = router;




