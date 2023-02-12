

//Validate the review information in the reviewForm
function validateReviewForm() {
  //Check if all fields are filled out
  if (reviewForm.name.value === "" || reviewForm.rating.value === "" || reviewForm.review.value === "") {
    alert("Please fill out all fields before submitting the form.");
    return false;
  }
  //Check if rating is between 1 and 5
  if (reviewForm.rating.value < 1 || reviewForm.rating.value > 5) {
    alert("Please enter a rating between 1 and 5.");
    return false;
  }
  //If all checks pass, return true
  return true;
}

//Add review to MongoDB database
function addReviewToDatabase(review) {
  //Create new review object
  const newReview = new Review({
    name: review.name,
    rating: review.rating,
    review: review.review
  });
  //Save review to database
  newReview.save((err, review) => {
    if (err) {
      alert("There was an error adding the review to the database. Please try again.");
      return false;
    }
    return true;
  });
}

//Add review to campground
function addReviewToCampground(review) {
  //Find campground
  Campground.findById(review.campgroundId, (err, campground) => {
    if (err) {
      alert("There was an error adding the review to the campground. Please try again.");
      return false;
    }
    //Add review to campground
    campground.reviews.push(review);
    //Save campground
    campground.save((err, campground) => {
      if (err) {
        alert("There was an error adding the review to the campground. Please try again.");
        return false;
      }
      return true;
    });
  });
}

//Add review to DOM
function addReviewToDOM(review) {
  //Create new review element
  const newReview = document.createElement("div");
  newReview.className = "review";
  //Create review content
  const reviewContent = `
    <h3>${review.name}</h3>
    <p>Rating: ${review.rating}/5</p>
    <p>${review.review}</p>
  `;
  //Add content to review element
  newReview.innerHTML = reviewContent;
  //Add review element to DOM
  const reviewsContainer = document.querySelector(".reviews-container");
  reviewsContainer.appendChild(newReview);
}

//Submit reviewForm
reviewForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //Validate reviewForm
  if (!validateReviewForm()) return;
  //Create review object
  const review = {
    name: reviewForm.name.value,
    rating: reviewForm.rating.value,
    review: reviewForm.review.value,
    campgroundId: reviewForm.campgroundId.value
  };
  //Add review to database
  if (!addReviewToDatabase(review)) return;
  //Add review to campground
  if (!addReviewToCampground(review)) return;
  //Add review to DOM
  addReviewToDOM(review);
  // Reset the form
  // reviewForm.elements.rating.value = 5;
  // reviewForm.elements.body.value = ' ';
  // reviewForm.elements.body.classList.remove('is-invalid');
  // reviewForm.elements.body.classList.remove('is-valid');
});