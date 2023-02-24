// declarations
const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const { Campground } = require('../models/campground')
const { Review } = require('../models/review')
const axios = require('axios')
const https = require('https');

const sample = array => array[Math.floor(Math.random()*array.length)]

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
  const c = await Campground.deleteMany({})
  const r = await Review.deleteMany({})
  console.log(`• sucess Campground.deleteMany : ${c}`)
  console.log(`• sucess Review.deleteMany : ${r}`)
}

// Step 2 - get multiple images and save in database
async function seedDB(iter) {
  await connectDB()
  for (let i = 0 ; i < iter ; i++) {
    const rand_1000 = Math.floor(Math.random()*1000)
    const img = await seedImg7() // "https://fastly.picsum.photos/id/236/500/400.jpg?hmac=PHAd3JlI7YLxBTFJBh2VxmleGFQLLv-Wr4VJbfuk4uQ"
    console.log(`Result for image #${i}: ${img}`)
    const camp = new Campground({
      author: '63ef8864aff4d160c021cdb4', 
      location: `${cities[rand_1000].city}, ${cities[rand_1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: `${Math.floor(Math.random()*100)+10}`,
      images: [{url: img , filename: 'unsplash random image'}],
      description: "Enter your description here (with fetch Img7)",
      geometry: {
        type: "Point",
        coordinates: [ cities[rand_1000].longitude, cities[rand_1000].latitude ]
      }
    })
    await camp.save()
  }  
}

// avec fetch - OK GOOD !!! 


// avec axios.get - try/catch - ne fonctionne pas
async function getImg2() {
  // call unsplash and return small image
  try {
    let config = { headers: {Accept:'application/json'}}
    const resp = await axios.get(url, config)
    // const ret = await resp.json()
    console.log(`Here is the response: ${resp}`)
    // console.log(`Here is the url: ${ret.urls.small}`)
    return resp
  } catch (err) {
    console.error(`Fab error:${err}`)
  }
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

// from Brandon - long
async function seedImg6() {
  try {
      const resp = await axios.get("https://api.unsplash.com/photos/random", {
          params: {
            client_id: "kYAVZ2Halw1xhfPIM-N6LRiI31cMtXYLqtDbLgHPqcU",
            collections: 1114848,
            orientation: "landscape",
            count : 30 //max count allowed by unsplash API
          },
          headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'If-None-Match': 'c523b36f867debdf152790574ec4989b'
          }
      });
      return resp // .data.urls.small;
  } catch (err) {
      console.error("Fab ERROR:", err);
  }
}

// from Brandon - original
async function seedImg7() {

  try {
    const res = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        // client_id: '****YOUR CLIENT ID GOES HERE****',
        client_id: "kYAVZ2Halw1xhfPIM-N6LRiI31cMtXYLqtDbLgHPqcU",
        collections: 1114848,
      },      
    });
    const arry = res.data.urls.small;
    console.log("• Axios Response :", arry);
    return arry
  } catch (err) {
    console.error("▼ Axios Error:", err)
  }
}

async function seedImg8() {
    return "https://random.imagecdn.app/500/150"
}


seedImg7()

seedDB(5)