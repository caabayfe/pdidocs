var UXAError = Class.create();
UXAError.prototype = Object.extendsObject(Error, {
    initialize: function(errorType, message) {
        this.errorType = errorType;
        this.message = message;
    },
    getErrorType: function() {
        return this.errorType;
    },

    getErrorMessage: function() {
        return this.message;
    },
    type: 'UXAError'
});

UXAError.getGenericError = function(err) {
    var genericError = new sn_ws_err.ServiceError();
    var statusCode = 500;
    if (UXAError.prototype.isPrototypeOf(err))
        statusCode = this.getStatusCode(err.getErrorType());
    var message = err.message;
    genericError.setStatus(statusCode);
    genericError.setMessage(message);
    return genericError;
};
