const express = require('express');
const router = express.Router();
const multer = require('multer');

const { storage } = require('../cloudinary'); // import the cloudinary storage object. No need to specify the filename, because we used index.js as the filename, which is the default filename
// const upload = multer({ dest: 'uploads/' }) // to store images locally
const upload = multer({ storage }, // to store images on cloudinary
  // { filename: function (req, file, cb) {  // specify the filename for the image to be stored on cloudinary. file stands for the file that is being uploaded. cb stands for callback. cb is a function that is called when the filename is ready. cb takes two parameters, the first is the error, the second is the filename.
  //   cb(null, Date.now() + file.originalname);  // Date.now() is used to make sure the filename is unique. null is used for the error parameter. 
  // }, 
  // fileFilter: function (req, file, cb) { // specify the file type to be stored on cloudinary 
  //   checkFileType(file, cb); // call the checkFileType function and pass in the file and the callback function as parameters. The checkFileType function is defined below.
  // },
// }
); // to store images on cloudinary

const checkFileType = (file, cb) => { // define the checkFileType function. file stands for the file that is being uploaded. cb stands for callback. cb is a function that is called when the filename is ready. cb takes two parameters, the first is the error, the second is the filename.
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/; // define the allowed file types
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // check if the file type is allowed
  // Check mime - mimetype is the type of file that is being uploaded (e.g. image/jpeg)
  const mimetype = filetypes.test(file.mimetype); // check if the file type is allowed. This is done by checking the mimetype of the file that is being uploaded, not the extension of the file that is being uploaded, but the actual content of the file that is being uploaded.

  if (mimetype && extname) { // if the file type is allowed
    return cb(null, true); // return the callback function with null for the error parameter and true for the filename parameter
  } else { // if the file type is not allowed
    cb('Error: Images Only!'); // return the callback function with the error message for the error parameter and false for the filename parameter
  }
};

// a function that checks the number of images that are being uploaded. If the number of images is more than 3, then the upload will be rejected and a error message will be displayed to the user.
const checkImageCount = (req, res, next) => {
  if (req.files.length > 3) { // if the number of images is more than 3
    // pop all the images after the third image from the req.files array
    while (req.files.length > 3) {
      req.files.pop();
    }
    // display an error message to the user
    req.flash('error', 'You can only upload a maximum of 3 images per campground');
    // redirect the user back to the edit page
    return res.redirect(`/campgrounds/${req.params.id}/edit`);
  }
  next(); // if the number of images is less than or equal to 3, then call the next middleware
}




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
  .put(isLoggedIn, upload.array('images', 3), isAuthor, catchAsync(campgrounds.update))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.route("/:id/edit")
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderUpdateForm))

module.exports = router;




