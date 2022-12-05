const express = require('express')
const ejs = require('ejs')
const path = require('path')

mongosse.connect('mongodb://127.0.0.1:27017/yelp-camp')

const app = express()

app.set('views', path.join(__dirname,"/views"))
app.set('view engine', 'ejs')

app.get('/', (req,res) => {
  // res.send('Hello from YelpCamp')
  res.render('home')
})


app.listen(3000, () => {
  console.log("Listening on localhost:3000")
})

