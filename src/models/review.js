const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi') // validating schema

const reviewSchema = new Schema ({
  body: String,
  rating: Number,
})

const reviewValidator = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required()
})

// compile model from schema
const Review = mongoose.model('Review', reviewSchema)

// export model
module.exports = { 
  Review,
  reviewValidator
}

