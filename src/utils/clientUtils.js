async function isUrlAnImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType && contentType.startsWith('image/');
  } catch (error) {
    console.error(error);
    return false;
  }
}

const checkImage = async (url) => {
  if (url && url.length > 0) {
    const isImage = await isUrlAnImage(url);
    if (!isImage) {
      console.error(`${url} is not a valid image URL.`);
      return false;
    }
  } else {
    console.error('URL is not defined or is empty.');
    return false;
  }
  return true;
}

module.exports = checkImage;