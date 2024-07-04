class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
        this.statusCode = statusCode

    Error.captureStackTrace(this, this.constructor);
    // return this.message;
    // console.log("object constructor:>>",this.message)
  }
}

module.exports = ErrorHandler;