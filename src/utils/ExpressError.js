// Comments from ChatGPT: There is a problem with the constructor of the ExpressError class. The self function is not being called with any arguments and it should be super() that is used to call the parent constructor. Also, the class should be exported using default keyword.

// solution 1 - ChatGPT
class ExpressError extends Error {
  constructor(message, statusCode) {
    super("▲ ExpressError: " + message);   // 
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError; // remember the =


/* // solution 2 - Teacher
class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.message = message;
    this.status = status;
  }
}

module.exports ExpressError; */