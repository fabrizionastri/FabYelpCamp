const path = require('path')
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')

const methodOverride = require('method-override')
const Campground = require('./models/campground')

const app = express()

// tell express to use ejsMate engine
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

app.get('/', (req,res) => {
  console.log('Hello from YelpCamp Home')
  res.render('home')
})

app.get('/campgrounds', async (req,res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', async (req,res) => {
  console.log("Got a new campgrounds GET request via Express")
  res.render('campgrounds/new')
})

app.post("/campgrounds", async (req,res) => {
  // res.send(req.body)
  const data = req.body.campground
  console.log(`POST request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  const campground = new Campground(data)
  await campground.save()
    .then((m) => { console.log("New campground added to MongoDB", m)})
    .catch((e) => { console.log("Error when attempting to add campground to MongoDB", e)})
  res.redirect(`/campgrounds`) // for later → /${campgrounds._id}`)
})

// a PUT using a post route to send data from edit product form
app.put("/campgrounds/:id", async (req,res) => {
  // res.send("going to update")
  const { id } = req.params
  const data = req.body.campground
  console.log(`PUT request for: ${data.title} in ${data.location} for at ${data.price} €/night`)
  console.log(data)
  await Campground.findByIdAndUpdate(id, data, {new:true, runValidators: true})
    .then((m) => { console.log("Updating product to MongoDB", m)})
    .catch((e) => { console.log("Error when attempting to update to MongoDB", e)})
  res.redirect(`/campgrounds/${id}`)
})

app.get('/campgrounds/:id', async (req,res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/show', {id, campground})
})

app.get("/campgrounds/:id/edit", async (req,res) => {
  // res.send("I'm here :) !")
  console.log("Got a GET request to edit campground")
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (campground) {
    console.log("Editing campground:", id)
    res.render('campgrounds/edit', { campground , id})
  }
  else {
    res.send("Campground not found here")
  }
})

// a Delete using a post route to send data from edit product form
app.delete("/campgrounds/:id", async (req,res) => {
  // res.send("going to delete")
  const { id } = req.params
  const data = req.body
  console.log(data)
  await Campground.findByIdAndDelete(id)
    .then((m) => { console.log("Deleting campground from MongoDB", m)})
    .catch((e) => { console.log("Error when attempting to delete campgrounds from MongoDB", e)})
  res.redirect(`/campgrounds`)
})





app.listen(3000, () => {
  console.log("Serving yelpCamp on localhost:3000")
})

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
  .then((m) => {
    console.log("MongoDB connection OPEN with Mongoose for yelpCamp")
  })
  .catch((e) => {
    console.log("MongoDB connection ERROR with Mongoose for yelpCamp", e)
  })
