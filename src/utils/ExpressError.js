/* // solution 1 - Fab
class ExpressError extends Error {
  constructor(message, statusCode) {
    super("▼ ExpressError: " + message);   // 
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError; // remember the = 
*/

// solution 2 - Teacher
class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.message = message;
    this.status = status;
  }
}

module.exports = ExpressError;