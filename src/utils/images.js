async function getImg() { 
  const url = "https://api.unsplash.com/photos/random?client_id=kYAVZ2Halw1xhfPIM-N6LRiI31cMtXYLqtDbLgHPqcU&collections=1114848"
  const req = await fetch(url)
  const ret = await req.json()
  const img = ret.urls.small
  return img
}

module.exports = { getImg };