const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi') // validating schema
const { User } = require('./user') // import review model

const ReviewSchema = new Schema ({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

const reviewValidator = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required()
})

// compile model from schema
const Review = mongoose.model('Review', ReviewSchema)

// export model
module.exports = { Review, reviewValidator }

