var PasswordResetResponseUtility = Class.create();
PasswordResetResponseUtility.prototype = Object.extendsObject(PasswordResetResponseConstants, {
    initialize: function() {
        this.hasError = false;
        this.statusMessage = "";
        this.statusCode = null;
    },
    isError: function() {
        return this.hasError;
    },
    getStatusMessage: function() {
        return this.statusMessage;
    },

    getStatusCode: function() {
        return this.statusCode;
    },

    setError: function(errorCode, values) {
        this.hasError = true;
        if (gs.nil(errorCode))
            return;
        this.statusCode = errorCode;
        var errorObj = this.ERROR;
        if (errorObj.hasOwnProperty(errorCode))
            this.statusMessage = this.formatMessage(errorObj[errorCode], values);
    },

    setSuccess: function(successCode, values) {
        this.hasError = false;
        if (gs.nil(successCode))
            return;
        this.statusCode = successCode;
        var successObj = this.SUCCESS;
        if (successObj.hasOwnProperty(successCode))
            this.statusMessage = this.formatMessage(successObj[successCode], values);
    },

    formatMessage: function(message, values) {
        if (gs.nil(values))
            return message;
        var result = message;
        for (var i = 0; i < values.length; i++) {
            result = result.replace('{' + i + '}', values[i]);
        }
        return result;
    },
});
