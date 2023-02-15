const mongoose = require('mongoose') // ORM for MongoDB
const Schema = mongoose.Schema // Schema constructor
const Joi = require('joi') // validating schema
const { Review } = require('./review') // import review model

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

// Mongoose middleware
// delete all reviews associated with the campground when the campground is deleted
// this is a post middleware. It runs after the campground is deleted
// this is a document middleware. It runs on a single document
// this is a query middleware. It runs on a query


campgroundSchema.post('findOneAndDelete', async function (campground) { // delete all reviews associated with the campground
  // check if the campground has any reviews. If it does, delete all reviews associated with the campground. If it doesn't, do nothing
  try {
      if (campground.reviews.length > 0) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews }}) // use _id instead of id, otherwise it will delete all reviews from all campgrounds
          .then (m => console.log('• Successfully deleted all reviews associated with the campground! :', m))
          .catch (e => console.log('▼ Error when attempting Review.deleteMany to delete all reviews associated with the campground! ', e))
        console.log('• Res :', res)
      }
      else {
        console.log('• There were no reviews associated with the campground to be deleted!')
      }
  } catch (e) {
    console.log("▼ Error when attempting to delete all reviews associated with the campground! ▼ Error: ", e)
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