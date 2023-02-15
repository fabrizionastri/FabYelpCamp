const express = require('express');
const router = express.Router();
const session = require('express-session') // session management
const flash = require('connect-flash') // flash messages

const { Campground , campgroundValidator } = require('../models/campground'); // import the campground model

const checkImage = require('../utils/checkImage');
const catchAsync = require('../utils/catchAsync'); // import the catchAsync function
const ExpressError = require('../utils/ExpressError'); // import the ExpressError class

// MIDDLEWARE

const validateCampground = (req, res, next) => { // middleware to validate the campground
  const { error } = campgroundValidator.validate(req.body)
  console.log("• validateCampground result:", error)
  if (error) {
    // const msg = '▲ ' + result.error.details.map(el => el.message).join(' → ')
    console.log("▼ validateCampground error:", error.details)
    const msg = "▼ validateCampground error: " + error.details.map(el => el.message).join(' → ')
    throw new ExpressError(msg,400)
  } 
  else { 
    console.log("calling next() from: validateCampground")
    next()
  }
}

// ROUTES

router.get('/', catchAsync(async (req,res) => { // index campgrounds
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', async (req,res) => {
  console.log("Got a new campgrounds GET request via Express")
  res.render('campgrounds/new')
})

router.put("/:id", validateCampground, catchAsync(async (req,res, next) => { // a PUT using a post route to update a campground
  // res.send("going to update")
  const { id } = req.params
  const data = req.body.campground
  data.image = await checkImage(data.image) // check the image before updating the campground
  console.log(`• PUT request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  console.log(data) 
  await Campground.findByIdAndUpdate(id, data, {new:true, runValidators: true})
    // .then((m) => { console.log("Updating product to MongoDB "/* , m */)})
    // .catch((e) => { console.log("▲ router.put/:id - Error when attempting to update to MongoDB ▲  "/* , e */)})
  res.redirect(`/campgrounds/${id}`)
}))

router.get('/:id', catchAsync( async (req,res) => { // show route for campgrounds
  const campground = await Campground.findById(req.params.id).populate('reviews')
    .catch((e) => { 
      req.flash('error', ' Not a valid campground ID '); // remember to use req.flash() and not res.flash())
      console.log("Not a valid campground ID "/* , e */)})
  if (!campground) {
    req.flash('error', ' Campground not found ') // remember to use req.flash() and not res.flash()
    return res.redirect('/campgrounds')
  }
  // console.log("• campground.image before checkImage:", campground.image)
  campground.image = await checkImage(campground.image) // remember to await the result of the function !!!!!
  // console.log("• campground.image after checkImage:", campground.image)
await campground.populate('reviews')
  if (!campground) throw new ExpressError('▲ Fab baby : Invalid campground id', 507);
  res.render('campgrounds/show', {campground})
}))

router.post("/", validateCampground, catchAsync(async (req,res, next) => { // note that you the 2 middleware a separated by a "," and are not embedded
  const data = req.body.campground
  console.log(`• POST request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  const campground = new Campground(data)
  campground.image = await checkImage(campground.image) // remember to await the result of the function !!!!!
  await campground.save()
    .then((m) => { 
      req.flash('success', 'Successfully made a new campground!');
      console.log("• New campground added to MongoDB"/* , m */)})
    .catch((e) => { 
      req.flash('error', 'Error when attempting to add campground!');
      console.log("▼ Error when attempting to add campground to MongoDB: "/* , e */)
    })
  req.flash('success', 'Successfully created a new campground!')
  res.redirect(`campgrounds/`) // for later → /${campgrounds.id}`)
}))

//this is the original delete route
router.delete("/:id", catchAsync(async (req,res) => { // a DELETE route to delete a campground and all related reviews (the reviews are deleted from the review collection and the review id is removed from the campground.reviews array thanks to the middleware in the campground model)
  const { id } = req.params
  const data = req.body
  console.log(data)
  await Campground.findByIdAndDelete(id)
    .then((m) => {
      req.flash('success', 'Successfully deleted a campground and all related reviews!');
      console.log("• Deleting campground from MongoDB ", m)})
    .catch((e) => {
      console.log("Error when attempting to delete campground!" , e )
      req.flash('error', 'Error when attempting to delete campground!');
    })
  res.redirect(`/campgrounds`)
}))

/* // this is the new delete route, without the delete reviews middleware
router.delete("/:id", catchAsync(async (req,res) => { // a DELETE route to delete a campground and all related reviews (the reviews are deleted from the review collection and the review id is removed from the campground.reviews array thanks to the middleware in the campground model)
  const data = req.body
  console.log(data)
  try {
    const campground = await Campground.findById(req.params.id)
    await campground.remove()
    await Review.deleteMany({ _id: { $in: campground.reviews }})
    req.flash("success", "Campground deleted successfully!")
    res.redirect("/campgrounds")
  } catch (err) {
    req.flash("error", err.message)
    res.redirect("back")
  }
}))


  await Campground.findByIdAndDelete(id)
    .then((m) => {
      req.flash('success', 'Successfully deleted a campground and all related reviews!');
      console.log("• Deleting campground from MongoDB ", m)})
    .catch((e) => {
      console.log("Error when attempting to delete campground!" , e )
      req.flash('error', 'Error when attempting to delete campground!');
    })
  res.redirect(`/campgrounds`)
})) */

/* 
try {
  if (campground.reviews.length > 0) {
    const res = await Review.deleteMany({ id: { $in: campground.reviews }})
      .then (m => console.log('• Successfully deleted all reviews associated with the campground! :', m))
      .catch (e => console.log('▼ Error when attempting to delete all reviews associated with the campground! ', e))
    console.log('• Res :', res)
  }
  else {
    console.log('• There were no reviews associated with the campground to be deleted!')
  }
} catch (e) {
console.log("▼ Error when attempting to delete all reviews associated with the campground! ▼ Error: ", e)
} */

router.get("/:id/edit", catchAsync(async (req,res) => {
  console.log("• Got a GET request to edit campground")
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (campground) {
    console.log("• Editing campground:", id, " ▲ ")
    res.render('campgrounds/edit', { campground , id})
  }
  else {
    res.send("▲ Campground not found here - get/campgrounds/:id/edit ▲ ")
  }
}))

module.exports = router;




