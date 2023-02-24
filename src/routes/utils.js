const express = require('express') // Express
const router = express.Router() // Router
const User = require('../models/user')  // User Model
const { Review } = require('../models/review')  // User Model
const { Campground } = require('../models/campground')  // User Model
const { catchAsync } = require('../utils/errors') // home made error handling middleware and class
const mapBoxToken = process.env.MAPBOX_TOKEN; // import the mapbox token from the .env file
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // import mapbox geocoding
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // create a geocoder object


// ROUTES

router.get('/check-image', async (req,res) => {
  console.log("• Got a new check-image GET request via Express")
  res.render('utils/checkImage')
})

router.get('/geodata', async (req, res, next) => {
  res.render('utils/geodata', { geoData : null})
})

router.post('/geodata', async (req, res, next) => {
  const userInput = req.body.userInput
  let places = ""
  if (userInput) { 
    const geoData = await geocoder.forwardGeocode({
      query : userInput
    }).send() // use the geocoder to get the latitude and longitude of the location
    places = geoData.body.features.map(f => f.place_name)
    console.log("• Got a new geodata GET request via Express")
    console.log("• places = ", places)
  } 
  res.render('utils/geodata', { places })
})

router.get('/chicken', catchAsync(async (req,res) => { // a route to test error handling
  console.log("▼ Post an error message to the console - chicken.fly before  ▲ ")
  chicken.fly() // this will throw an error because the function fly() does not exist
  console.log("▼ Post an error message to the console - chicken.fly after  ▲ ")
}))

router.get('/fakeUser', async (req,res) => { // a route to create a fake user
  const user = new User({username: "Fabrizio", email : "fabrizio@yahoo.com"}) // create a new user  (note that the password is not set)
  const newUser = await User.register(user, "chicken")  // register the user with the password "chicken". This will hash the password and save the user in the database. User.register() is a passport-local-mongoose method
  res.send(newUser)
})

router.get('/cleanup', async (req,res) => { // a route to remove all orphan reviews (reviews in campground.review that do not exist in the reviews collection)
  const campgrounds = await Campground.find({})
  let count = 0
  for (let campground of campgrounds) {
    for (let reviewId of campground.reviews) {
      // check if the review exists in the reviews collection
      let exists = await Review.find({_id: reviewId})
      if (exists.length === 0) {
        // if the review does not exist, remove it from the campground.reviews array
        campground.reviews = campground.reviews.filter(id => id !== reviewId)
        await campground.save()
        console.log("Removed review " + reviewId + " from campground " + campground.title)
        count++
      }
    }
  }
  if (count) {
    req.flash('success', 'Removed ' + count + ' orphan reviews')
  } else {
    req.flash('success', 'No orphan reviews found')
  }
  res.redirect("/campgrounds")
})

router.get('/transferimages', async (req,res) => { 
  // a route to transfer images from the old image field to the new images array'
  //   const mongoose = require('mongoose');
  // // Connect to the database
  // mongoose.connect('mongodb://localhost/your_db_name', { useNewUrlParser: true });
  // // Get a reference to the Campground model
  // const Campground = require('./models/campground');

  // Find all campgrounds and update their images
  Campground.find({}, (err, campgrounds) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    campgrounds.forEach((campground) => {
      // Check if the old image field is set
      if (campground.image) {
        // Append the old image to the images array
        campground.images.push({ url: campground.image, filename: 'image' });
        // Clear the old image field
        campground.image = undefined;
        // Save the updated campground
        campground.save((saveErr) => {
          if (saveErr) {
            console.error(saveErr);
          } else {
            console.log(`Updated campground: ${campground._id}`);
          }
        });
      }
    });
  });
  res.redirect("/campgrounds")
})

module.exports = router