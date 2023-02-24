const cloudinary = require('cloudinary').v2; // a library to upload images to the Cloudinary cloud service
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // a library connect multer to cloudinary
// const express = require('express'); // a library to create a web server
const multer = require('multer'); // a library to handle multipart/form-data, which is primarily used for uploading files
 
// const app = express(); // create a web server

cloudinary.config({ // configure cloudinary with your credentials
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // get the cloud name from the .env file
  api_key: process.env.CLOUDINARY_KEY, // get the api key from the .env file
  api_secret: process.env.CLOUDINARY_SECRET // get the api secret from the .env file
});

const storage = new CloudinaryStorage({ // configure cloudinary storage with your credentials
  cloudinary: cloudinary, // use the cloudinary object created above
  params: {
    folder: 'yelpCamp', // The name of the folder in the cloudinary cloud
    allowedFormats: ['jpeg', 'png', 'jpg', 'svg'], // The allowed formats of the image 
    transformation: [ // The transformation of the image
        { width: 800, height: 600, gravity: "auto", crop: "fill" }, // The width, height, gravity and crop of the image
    ], 
    format: 'jpg' // The format in which the image is stored on cloudinary
    // format: async (req, file) => 'png', // supports promises as well // The format of the image: jpg, png
    // public_id: (req, file) => 'computed-filename-using-request', // The file on cloudinary would have the same name as the original file name
  },
});
 
module.exports = { // export the storage object
  cloudinary,
  storage
};