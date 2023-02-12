const mongoose = require('mongoose') // ORM for MongoDB
const Schema = mongoose.Schema // Schema constructor
const Joi = require('joi') // validating schema
const Review = require('./review') // import review model

const campgroundSchema = new Schema ({ // define schema
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [  // this is an array of review ids
    { 
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
})

campgroundSchema.post('findOneAndDelete', async function (campground) { // delete all reviews associated with the campground
  if (campground.reviews.length) {
      const res = await Review.deleteMany({ id: { $in: campground.reviews } })
    console.log("Deleted reviews: ", res)
    }
})

const Campground = mongoose.model('Campground', campgroundSchema) // export model

const campgroundValidator =  Joi.object({
  // define validation schema
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(1),
    location: Joi.string().required(),
    description: Joi.string(),
    image: Joi.string(),
  }).required()
})

module.exports = {
  Campground,
  campgroundValidator
};