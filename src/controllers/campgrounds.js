const { Campground , campgroundValidator } = require('../models/campground'); // import the campground model
const { ExpressError, catchAsync } = require('../utils/errors'); // home made error handling middleware and class
const cloudinary = require('cloudinary').v2; // import cloudinary
const mapBoxToken = process.env.MAPBOX_TOKEN; // import the mapbox token from the .env file
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // import mapbox geocoding
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // create a geocoder object

// CONTROLLERS

module.exports.index = async (req,res) => { // index campgrounds
  console.log("• GET request to view campground index")
  const campgrounds = await Campground.find({}).populate('author')
  res.render('campgrounds/index', {campgrounds})
}

module.exports.renderCreateForm = async (req,res) => {  // show new campground form
  console.log("• GET request for form to create new campground")
  res.render("campgrounds/new")
}

module.exports.show = async (req,res) => { // show campgrounds details
  console.log("• GET request for campground with id: ", req.params.id)
 // find the campground with the provided id, and populate the reviews and author. 
  const campground = await Campground.findById(req.params.id)
  .populate({ path: 'reviews', populate: { path: 'author' } }) // it's probably more efficient to store the author review in the review model, but this is a good exercise
  .populate('author');
  console.log("• Responding with campground: ", campground)
  if (!campground) throw new ExpressError('▲ Fab baby : Invalid campground id', 507);
  res.render('campgrounds/show', {campground})
}

module.exports.create = async (req,res, next) => { // create new campground
  // note that you the 2 middleware a separated by a "," and are not embedded
  
  console.log(`• POST request for: ${req.body.title} in ${req.body.location} for at ${req.body.price} €/night`)
  console.log(req.body, req.files)
  const campground = new Campground(req.body.campground) // create a new campground
  const geoData = await geocoder.forwardGeocode({query : campground.location }).send()
  campground.geometry = geoData.body.features[0].geometry // add the geometry to the campground
  campground.address = geoData.body.features[0].place_name // add the address to the campground
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })) // map the files to an array of objects with the url and filename
  if (req.body.imageUrl) {
    const parts = req.body.imageUrl.split('/');
    const name = parts[parts.length - 1];
    campground.images.push({ url: req.body.imageUrl, filename: name })
  }
  campground.author = req.user._id
  // campground.image = await checkImage(campground.image) // this was my old solution, manually adding urls, remember to await the result of the function !!!!!
  await campground.save()
  console.log("• New campground added to MongoDB", campground)
  req.flash('success', `Successfully created a new campground ${campground.title}!`)
  res.redirect(`campgrounds/${campground._id}`)
}

module.exports.renderUpdateForm = async (req,res) => { // show campground edit form
  const { id } = req.params
  console.log("• GET request to edit campground with id: ", id)
  const campground = await Campground.findById(id)
  console.log("• Responding with edit form for campground: ", campground)
  res.render('campgrounds/edit', { campground , id})
}

module.exports.update = async (req,res, next) => { // a PUT using a post route to update a campground
  // res.send("going to update")
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {... req.body.campground}) // find the campground and update it with the data from the form body
  const geoData = await geocoder.forwardGeocode({query : campground.location }).send()
  campground.geometry = geoData.body.features[0].geometry // add the geometry to the campground
  campground.address = geoData.body.features[0].place_name // add the address to the campground
  const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.images.push(...newImages) // map the files to an array of objects with the url and filename
  await campground.save()
  if (req.body.imageUrl) {
    const parts = req.body.imageUrl.split('/');
    const name = parts[parts.length - 1];
    campground.images.push({ url: req.body.imageUrl, filename: name })
  }
  if (req.body.deleteImages) { // if the user has selected images to delete, remove them from the campground.images array
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) // remove the images from the campground.images array
      for (let filename of req.body.deleteImages) {// loop through the images to delete
        await cloudinary.uploader.destroy(filename) // delete the image from cloudinary
      }
  }
  req.flash('success', 'Successfully updated campground!'); // flash message
  res.redirect(`/campgrounds/${id}`) // redirect to the show page
  // }
}

module.exports.delete = async (req,res) => { // a DELETE route to delete a campground and all related reviews (the reviews are deleted from the review collection and the review id is removed from the campground.reviews array thanks to the middleware in the campground model)
  const { id } = req.params
  const campground = await Campground.findById(id)
  console.log("• DELETE request for campground with id: ", id, campground)
  let count = 0
  for (let image of campground.images) {// loop through the images to delete
    await cloudinary.uploader.destroy(image.filename);// delete the image from cloudinary
    count++
  }
  await Campground.findByIdAndDelete(id)
    .then((m) => {
      req.flash('success', ` Successfully deleted campground ${id}, ${count} of ${campground.images.length} related images, and ${campground.reviews.length} related reviews!`);
      console.log('• Deleting campground ', id, 'from MongoDB ', m)
      res.redirect(`/campgrounds`)
    })
    .catch((e) => {
      console.log("Error when attempting to delete campground!" , e )
      req.flash('error', 'Error when attempting to delete campground!');
    })
}

module.exports.deleteImage = async (req,res) => { // a DELETE route to delete a image from a campground. The image is deleted from the the campground.images array. A confirmation message is send back to the client indicating if the image was deleted or not. If the deletion is sucessful, the message is "Image deleted". If not, the message is "There was a problem, the image was not deleted". The client is responsible for updating the UI
  // this route causes the image to be deleted from the image collection and the image id to be removed from the campground.images array. A confirmation message is send back to the client indicating if the image was deleted or not. If the deletion is sucessful, the message is "Image deleted". If not, the message is "There was a problem, the image was not deleted". The client is responsible for updating the UI
  const { id, imageId } = req.params
  console.log(`• Deleting image ${imageId} from campground ${id}`)
  const campground = await Campground.findById(id)
  const imageName = campground.images.filter((image) => image._id == imageId)[0].filename // get the filename of the image to be deleted
  await cloudinary.uploader.destroy(imageName) // delete the image from cloudinary
  await campground.updateOne({ $pull: { images: { _id: imageId }}}) // remove the image id from the campground.images array
    .then((m) => {
      req.flash('success', `Successfully deleted image ${imageId} from campground ${id}`)
      console.log(`• Successfully deleted ${imageId} from campground ${id}! from MongoDB`, m)})
    .catch((e) => {
      req.flash('error', `Error when attempting to delete image ${imageId} from campground ${id}`)
      console.log(`▼ Error when attempting to delete image ${imageId} from campground ${id}`, e )
    })
  res.redirect(`/campgrounds/${id}/edit`)
}