
const catchAsync = (fn) => {
  // console.log("calling next() from catchAsync before return")
  return (req, resp, next) => {
    fn(req, resp, next).catch(next)
  }
}

class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.message = message;
    this.status = status;
  }
}

module.exports = { ExpressError , catchAsync }
