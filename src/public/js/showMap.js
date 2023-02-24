
mapboxgl.accessToken = mapToken // mapbox access token from environment variable


// get coordinates form campground object if it exists, otherwise use default coordinates
const coordinates = campground.geometry.coordinates+"" ? campground.geometry.coordinates :  [2.361438,48.853147]

console.log("coordinates", coordinates )

const map = new mapboxgl.Map({  // create map
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
  
const marker = new mapboxgl.Marker({
  color: "#FE1D6F",
  draggable: true
}) // Create a new marker.
.setLngLat(coordinates)  // Set the marker position.
.setPopup( // Set a popup on this marker.
  new mapboxgl.Popup({ offset: 25 }) // add popups
  .setHTML( // set the content of the popup
    `<h5>${campground.title}</h5><p>${campground.address}</p><p>${coordinates}</p>` // campground title and location
  )
)
.addTo(map);
