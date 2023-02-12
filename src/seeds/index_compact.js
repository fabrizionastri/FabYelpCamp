const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')


// Note: you need to create a API account on Unsplash and put your ID in place of <your_ID_here> below
const url = "https://api.unsplash.com/photos/random?client_id=<your_ID_here>&collections=1114848"

// Function to get one image url
async function getImg() { 
  const req = await fetch(url)
  const ret = await req.json()
  const img = ret.urls.small
  return img
}

// Function to open connection with MongoDB
async function  connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
  .then((m) => {
    console.log("MongoDB connection OPEN with Mongoose for yelpCamp")
  })
  .catch((e) => {
    console.log("MongoDB connection ERROR with Mongoose for yelpCamp", e)
  })
  // Empty the DB - no need to do this every time
  // const m = await Campground.deleteMany({})
}

// Function to get a random value from the places/descriptors arrays
const sample = array => array[Math.floor(Math.random()*array.length)]

// Command to clear the console
console.clear()

// Main seeding function to add multiple campgrounds to the DB
async function seedDB(nr) {
  await connectDB()
  for (let i = 0 ; i < nr ; i++) {
    const rand_1000 = Math.floor(Math.random()*1000)
    // use await to get the image url before proceededing
    const img = await getImg()
    console.log("Result for image URL:", img)
    const camp = new Campground({
      location: `${cities[rand_1000].city}, ${cities[rand_1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: `${Math.floor(Math.random()*100)+10}`,
      image: `${img}`, // use the `${...}` to force conversion into a string
      description: "Enter your description here compact"
    })
    await camp.save()
  }  
}

// Command to launch the seeding function.
// Start with only 1 to check that it works, then add the reste
seedDB(1)