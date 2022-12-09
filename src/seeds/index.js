// declarations
const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')
const axios = require('axios')
const https = require('https');

const sample = array => array[Math.floor(Math.random()*array.length)]

const url = "https://api.unsplash.com/photos/random?client_id=kYAVZ2Halw1xhfPIM-N6LRiI31cMtXYLqtDbLgHPqcU&collections=1114848"

console.clear()

// Step 1 - vider la base de données
async function  connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
  .then((m) => {
    console.log("MongoDB connection OPEN with Mongoose for yelpCamp")
  })
  .catch((e) => {
    console.log("MongoDB connection ERROR with Mongoose for yelpCamp", e)
  })
  const m = await Campground.deleteMany({})
  console.log(`sucess: ${m}`)
}

// Step 2 - get multiple images and save in database
async function seedDB(iter) {
  await connectDB()
  for (let i = 0 ; i < iter ; i++) {
    // setup
    // chose one of the following solutions
    // image: `https://random.imagecdn.app/500/300`,
    // image: "https://source.unsplash.com/collection/483251",
    const rand_1000 = Math.floor(Math.random()*1000)
    const img = await getImg2()
    console.log("tout chaud: ", img)
    const camp = new Campground({
      location: `${cities[rand_1000].city}, ${cities[rand_1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: `${Math.floor(Math.random()*100)+10}`,
      image: `${img}`,
      description: "Enter your description here 2"
    })
    console.log(`Result for image URL: ${camp.image}`)
    await camp.save()
  }  
}

// avec axios.get - try/catch - ne fonctionne pas
async function getImg1() {
  // call unsplash and return small image
  try {
    // let config = {headers: {Accept:'application/json'}}
    const resp = await axios.get(url, config)
    // const ret = await resp.json()
    console.log(`Here is the response: ${resp}`)
    // console.log(`Here is the url: ${ret.urls.small}`)
    return resp
  } catch (err) {
    console.error(`Fab error:${err}`)
  }
}

// avec fetch - ne fonctionne pas
async function getImg2() { 
  const req = await fetch(url)
  const ret = await req.json()
  const img = ret.urls.small
  return img
}

// avec axios.get / then ne fonctionne pas
async function getImg3() {
  let data
  let config = {headers: {Accept:'application/json'}}
  axios.get(url, config)
    .then((res) => {
      console.log("→ Axios res: ", res)
      console.log("→ Axios res.data: ", res.data)
      data = res.data
    })
    .catch((error) => {
      // handle error
      console.log("→ Got Axios ERROR → ", error)
      throw new Error("Fab Axios Error")
    })
  return data
}

// ne fonctionne pas
async function getImg4() {
  https.get(url, (resp) => {
    let data = '';
    // Un morceau de réponse est reçu
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // La réponse complète à été reçue. On affiche le résultat.
    resp.on('end', () => {
      let image = JSON.parse(data).urls.small
      console.log("JSON Result:", image)
      return image;
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

async function getImg5() {
  let data;
  try {
    const response = await axios.get(url);
    console.log(response.data);
    data = response.data;
  } catch (error) {
    console.log(error.message);
    return;
  }
  console.log(data)
  return data;
};
seedDB(20)