class ErrorHandler {
  constructor() {}

  throwBadRequestError(message) {
    var error = new Error(message);
    error.name = 'BadRequestError';
    error.fBadRequest = true;
    throw error;
  }

  throwBadConfigError(message) {
    var error = new Error(message);
    error.name = 'BadConfigurationError';
    throw error;
  }

  throwInternalError(message) {
    var error = new Error(message);
    error.name = 'InternalServerError';
    throw error;
  }

  throwNotFoundError(message) {
    var error = new Error(message);
    error.name = 'NotFoundError';
    error.fNotFound = true;
    throw error;
  }

  /**
   * Throws an error an sn_ws error when the error type is caught from within one of our services.
   *
   * @param {Error} Caught instance of one of the thrown errors from a function within in this class.
   * The name on the Error parameter indicates which type of sn web error will be thrown.
   *
   * @return {N/A} In all paths an error will be thrown.
   */
  throwSnWsError(error) {
    var errorMessage =
      'Internal MAB error of type ' + error.name + ': ' + error.message;

    if (error.fBadRequest) {
      throw new sn_ws_err.BadRequestError(errorMessage);
    } else if (error.fNotFound) {
      throw new sn_ws_err.NotFoundError(errorMessage);
    } else {
      // there is no dedicated sn_ws_err for 500 errors
      gs.error(errorMessage);
      throw error;
    }
  }
}

module.exports = ErrorHandler;
