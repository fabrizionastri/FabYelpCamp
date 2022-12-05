const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CampGroundSchema = new Schema ({
  title: String,
  price: String,
  description: String,
  location: String,
})

module.export = mongoose.model('Campground', CampGroundSchema)
