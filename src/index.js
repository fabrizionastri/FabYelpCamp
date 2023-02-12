const express = require('express') // 
const path = require('path')
const mongoose = require('mongoose') // working with MongoDB
const ejs = require('ejs') // templating
const ejsMate = require('ejs-mate')
const { Campground , campgroundValidator } = require('./models/campground') // home made mongoose data model + Joi validation schema
const { Review, reviewValidator } = require('./models/review') // home made mongoose data model + Joi validation schema
// const multer = require('multer') // working with images modules, can be used to check image utils
const { checkImage } = require('./utils/clientUtils') // home made image utils
const catchAsync = require('./utils/catchAsync') // home made Error hangling middleware
const ExpressError = require('./utils/ExpressError') // home made Error class
const methodOverride = require('method-override') // using other verbs than GET and PUT with HTML forms

const app = express()

// tell express to use ejsMate engine
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

// define a new middleware function that takes a function as an input
const validateCampground = (req, res, next) => {
  const result = campgroundValidator.validate(req.body)
  console.log("• validateCampground result:", result)
  if (result.error) {
    // const msg = '▲ ' + result.error.details.map(el => el.message).join(' → ')
    console.log("▼ validateCampground error:", result.error.details)
    const msg = '▼ validateCampground error: ' + result.error.details.map(el => el.message).join(' → ')
    throw new ExpressError(msg,400)
  } 
  else { 
    next()
  }
}

// define a new middleware function that takes a function as an input
const validateReview = (req, res, next) => {
  const result = reviewValidator.validate(req.body)
  console.log("• reviewValidator Joi result:", result)
  if (result.error) {
  // const msg = '▲ ' + result.error.details.map(el => el.message).join(' → ')
  console.log("• reviewValidator Joi Details:", result.error.details)
  const msg = '▲ Error Joi reviewValidator ' + result.error.details.map(el => el.message).join(' → ')
  throw new ExpressError(msg,400)
  } 
  else { 
    next()
  }
}

app.get('/', (req,res) => {
  console.log('Hello from YelpCamp Home')
  res.render('home')
})

app.get('/campgrounds', catchAsync(async (req,res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', async (req,res) => {
  console.log("Got a new campgrounds GET request via Express")
  res.render('campgrounds/new')
})

app.get('/campgrounds/:id', catchAsync( async (req,res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews')
  // await campground.populate('reviews')
  if (!campground) throw new ExpressError('▲ Fab baby : Invalid campground id', 507);
  res.render('campgrounds/show', {campground})
}))

app.get('/check-image', async (req,res) => {
  console.log("• Got a new check-image GET request via Express")
  res.render('others/checkImage')
})

// note that you the 2 middleware a separated by a "," and are not embedded
app.post("/campgrounds", validateCampground, catchAsync(async (req,res, next) => {
  data = req.body.campground
  console.log(`• POST request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  const campground = new Campground(data)
  await campground.save()
    .then((m) => { console.log("• New campground added to MongoDB"/* , m */)})
    .catch((e) => { console.log("▲ Error when attempting to add campground to MongoDB ▲"/* , e */)})
  res.redirect(`/campgrounds`) // for later → /${campgrounds.id}`)
}))

// a PUT using a post route to send data from edit product form
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req,res, next) => {
  // res.send("going to update")
  const { id } = req.params
  const data = req.body.campground
  console.log(`• PUT request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  console.log(data) 
  await Campground.findByIdAndUpdate(id, data, {new:true, runValidators: true})
    // .then((m) => { console.log("Updating product to MongoDB "/* , m */)})
    // .catch((e) => { console.log("▲ app.put/campgrounds/:id - Error when attempting to update to MongoDB ▲  "/* , e */)})
  res.redirect(`/campgrounds/${id}`)
}))

// a POST route to add a review to a campground used by the form in the show.ejs template
app.post("/campgrounds/:id/addreview", catchAsync(async (req,res, next) => {
  console.log("• Received a post request for a new review:", req.body.review)
  const { id } = req.params
  const campground = await Campground.findById(id)
  console.log("• For the target campground with id: ", id)
  console.log(campground)
  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  console.log("• New review:", review)
  res.redirect(`/campgrounds/${id}`)
}))

// a basic POST route to add a generti review to a campground used by the form in the show.ejs template - This works
app.post("/campgrounds/:id/addreview2", validateReview, catchAsync(async (req,res, next) => {
  console.log("• post new review:")
  const review = new Review({
    body: "This is a test review",
    rating: 5
  })
  await review.save()
  console.log("• New review:", review)
}))

// a DELETE route to delete a review
// this route causes the review to be deleted from the review collection and the review id to be removed from the campground.reviews array. A confirmation message is send back to the client indicating if the review was deleted or not. If the deletion is sucessful, the message is "Review deleted". If not, the message is "There was a problem, the review was not deleted". The client is responsible for updating the UI
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req,res) => {
  const { id, reviewId } = req.params
  console.log("• Deleting review:", reviewId, "from campground:", id)
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
  await Review.findByIdAndDelete(reviewId)
  res.redirect(`/campgrounds/${id}`)
}))

app.get('/chicken', catchAsync(async (req,res) => {
  console.log("▼ Post an error message to the console - chicken.fly before  ▲ ")
  chicken.fly()
  console.log("▼ Post an error message to the console - chicken.fly after  ▲ ")
}))

app.get("/campgrounds/:id/edit", catchAsync(async (req,res) => {
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

// a DELETE route to delete a campground, which will delete the campground and all its reviews
// app.delete("/campgrounds/:id", catchAsync(async (req,res, next) => {
//   const { id } = req.params
//   console.log(`• DELETE request for campground id: ${id}`)
//   await Campground.findByIdAndDelete(id)
//   res.redirect(`/campgrounds`)
// }))

// NOT USED - See the one above
// Delete using a post route to send data from edit product form
app.delete("/campgrounds/:id", catchAsync(async (req,res) => {
  const { id } = req.params
  const data = req.body
  console.log(data)
  await Campground.findByIdAndDelete(id)
    .then((m) => { console.log("• Deleting campground from MongoDB ", m)})
    .catch((e) => { console.log("▲ app.delete/campgrounds/:id - Error when attempting to delete campgrounds from MongoDB ▲ " , e )})
  res.redirect(`/campgrounds`)
}))

// this will catch any request, for any path, that was not caught before
app.all("*", (req, res, next) => {
  // res.send('<h1>404 !!!</h1>')
  // I'm using next to pass this error to the next app.use (final one below)
  next(new ExpressError("▲ You've reached the end of the road.", 404))
})

// this will by caught by any next() that does not point to a previous next
// app.use( (err, req, res, next) => {
//   console.log("▼ Final app.use error handling middleware on console - before ")
//   const {statusCode = 500 } = err
//   if (!err.message) err.message = "▲ Final app.use - Something went wrong "
//   // note that status will only appear on the client console, while message will be sent to the browser
//   // use this to send a HTML message
//   // res.status(statusCode).send(message)
//   // or use this to send render a page. User {err} to destructure and send the error message to the page
//   res.status(statusCode).render("error", {err})
//   // and this message will apear on the server console
//   console.log("▲ Final app.use error handling middleware on console - after ", err)
// })

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

