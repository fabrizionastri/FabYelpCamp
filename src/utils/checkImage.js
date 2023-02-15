// Description: This file contains all the functions that are used in the server side.

// This function is used to check if the image URL is valid or not, returns true if the URL is valid and false if the URL is not valid.
async function isUrlAnImage(url, retries = 3) {
  while (retries > 0) {
    try {
      console.log("▼ isUrlAnImage try triggered");
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return contentType && contentType.startsWith('image/');
    } catch (error) {
      console.log("▼ isUrlAnImage catch(error) triggered");
      console.error(error);
      retries--;
    }
  }
  return false;
}

// check if the image URL is valid, if yes return the URL, if not return a backup image
async function checkImage (url) {
  const backupImage = "/images/backupImage.png";
  if (url && url.length > 0) {
    const isImage = await isUrlAnImage(url);
    console.log("• isImage returns: " + isImage);
    if (!isImage) {
      console.error(`▼ ${url} is not a valid image URL.`);
      console.error(`▼ Using backup image: ${backupImage}`);
      return backupImage;
    }
  } else {
    console.error('▼ Image URL is not defined or is empty.');
    return backupImage
  }
  return url;
}

module.exports = checkImage;