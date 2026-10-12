/**
 * WebApiErrorUtility class for creating standardized Web API errors.
 */
var WebApiErrorUtility = Class.create();
WebApiErrorUtility.prototype = {
    /**
     * Initializes the WebApiErrorUtility.
     */
    initialize: function() {
    },

    /**
     * Creates a BadRequestError (400) for Web API responses.
     * @param {string} responseErrorMessage - The error message for the response
     * @param {number} [httpErrorCode=400] - The HTTP status code
     * @param {string} [responseErrorDetail] - Additional error details
     * @param {string} [appErrorCode] - Application-specific error code
     * @param {string} [appErrorMessage] - Application-specific error message
     * @returns {sn_ws_err.BadRequestError} The configured error object
     */
    createBadRequestError: function (
        responseErrorMessage,
        httpErrorCode,
        responseErrorDetail,
        appErrorCode,
        appErrorMessage
    ) {
        return this._buildError(
            sn_ws_err.BadRequestError,
            responseErrorMessage,
            httpErrorCode || 400,
            responseErrorDetail,
            appErrorCode,
            appErrorMessage
        );
    },

    /**
     * Creates a ServiceError (500) for Web API responses.
     * @param {string} responseErrorMessage - The error message for the response
     * @param {number} [httpErrorCode=500] - The HTTP status code
     * @param {string} [responseErrorDetail] - Additional error details
     * @param {string} [appErrorCode] - Application-specific error code
     * @param {string} [appErrorMessage] - Application-specific error message
     * @returns {sn_ws_err.ServiceError} The configured error object
     */
    createServiceError: function (
        responseErrorMessage,
        httpErrorCode,
        responseErrorDetail,
        appErrorCode,
        appErrorMessage
    ) {
        return this._buildError(
            sn_ws_err.ServiceError,
            responseErrorMessage,
            httpErrorCode || 500,
            responseErrorDetail,
            appErrorCode,
            appErrorMessage
        );
    },

    /**
     * Internal helper to construct and decorate sn_ws_err errors consistently.
     * @private
     * @param {Function} ErrorCtor - The error constructor (BadRequestError or ServiceError)
     * @param {string} message - The error message
     * @param {number} status - The HTTP status code
     * @param {string} [detail] - Additional error details
     * @param {string} [appCode] - Application error code for logging
     * @param {string} [appMsg] - Application error message for logging
     * @returns {sn_ws_err.BadRequestError|sn_ws_err.ServiceError} The configured error object
     */
    _buildError: function (ErrorCtor, message, status, detail, appCode, appMsg) {
        try {
            if (appCode || appMsg) {
                // to feed into itom error framework later
                gs.error('Error Code: ' + appCode + ' Message: ' + appMsg);
            }
            var err = new ErrorCtor(message || 'Unexpected error');
            err.setMessage(message || 'Unexpected error');
            if (detail) err.setDetail(detail);
            if (status) err.setStatus(status);
            return err;
        } catch (e) {
            // Fallback to ServiceError if constructor not available in context
            var fallback = new sn_ws_err.ServiceError();
            fallback.setMessage(message || 'Unexpected error');
            if (detail) fallback.setDetail(detail);
            if (status) fallback.setStatus(status);
            return fallback;
        }
    },

    type: 'WebApiErrorUtility'
};
