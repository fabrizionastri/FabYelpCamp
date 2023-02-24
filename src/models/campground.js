const mongoose = require('mongoose') // ORM for MongoDB
const Schema = mongoose.Schema // Schema constructor
const BaseJoi = require('joi') // validating schema. We renamed it to BaseJoi to avoid confusion with the extended Joi
const { Review } = require('./review') // import review model

const opts = { toJSON: { virtuals: true }} // define option to include virtual properties in JSON

const sanitizeHtml = require('sanitize-html'); // sanitize html

const extension = (joi) => ({ // define custom joi extension
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { // this is the sanitize-html package
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension) // extend joi with custom extension. We used the name Joi to avoid confusion with the base joi, and to avoid having to change all the code that uses joi

const ImageSchema = new Schema ({ // define schema
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () { // define virtual property
  return this.url.replace('/upload', '/upload/w_300')
})

const CampgroundSchema = new Schema ({ // define schema
  title: String,
  image: String, // this is a string that contains the url of the main image
  images: [ImageSchema],  // this is an array of additional image objects
  address: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [  // this is an array of review ids
    { 
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () { // define virtual property
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>  
  <p>${this.description.substring(0, 20)}...</p>`
})

// Mongoose middleware
// delete all reviews associated with the campground when the campground is deleted
// this is a post middleware. It runs after the campground is deleted
// this is a document middleware. It runs on a single document
// this is a query middleware. It runs on a query


CampgroundSchema.post('findOneAndDelete', async function (campground) { // delete all reviews associated with the campground
  // check if the campground has any reviews. If it does, delete all reviews associated with the campground. If it doesn't, do nothing
  const reviewsInList = campground.reviews.length
  try {
      if (reviewsInList > 0) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews }}) // use _id instead of id, otherwise it will delete all reviews from all campgrounds
        console.log('• Reviews in List: ' + reviewsInList + ' deleteMany response :' + res.deletedCount)
      }
      else {
        console.log('• There were no reviews associated with the campground to be deleted!')
      }
  } catch (e) {
    console.log("▼ Error when attempting to delete all reviews associated with the campground! ▼ Error: ", e)
  }
})

const Campground = mongoose.model('Campground', CampgroundSchema) // export model

const campgroundValidator =  Joi.object({
  // define validation schema
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(1),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required(), // I should also use .escapeHTML(), but I leave the rich text editor for now as a challenge
    images: Joi.array(),
    image: Joi.string()
  }).required(),
  deleteImages: Joi.array()
})

module.exports = { Campground, campgroundValidator };