// Solution 1 - Fab  version
// function catchAsync(fn) {
//   return async function (req, resp, next) {
//     fn(req, resp, next).catch(e => {
//       console.log("Fab woz here");
//       next(e)
//     })
//   }
// }

/* // Solution 2 - teacher version
module.exports = fn => {
  return (req, resp, next) => {
    fn(req, resp, next).catch(next)
  }
} */

// Solution 3 - hybrid version
// this function catches an error and passes it to next
module.exports = fn => {
  return (req, resp, next) => {
    fn(req, resp, next).catch(e => {
      console.log("▼ utils/catchAsync on console");
      e.message = "▼ utils/catchAsync message to webpage: " + e.message
      next(e)
    })
  }
}