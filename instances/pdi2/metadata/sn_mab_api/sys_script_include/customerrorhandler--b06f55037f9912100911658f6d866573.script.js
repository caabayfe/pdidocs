class MABError extends Error {
    /**
     * Constructs a new MABError.
     *
     * @param {string} message - The error message.
     * @param {number} [status] - HTTP status code or application-specific status.
     * @param {string} [detail] - Additional details about the error.
     */
    constructor(message, status, detail) {
        super(message);
        this.name = new.target.name;
        this.status = status;
        this.detail = detail;

        // Set the prototype explicitly to ensure correct instanceof behavior in Rhino JavaScript Engine
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * A class for handling custom error logging and throwing exceptions.
 * This class provides methods to throw specific types of errors (e.g., Bad Request, Not Found, Internal Server Error),
 * log error details, and create ServiceNow Web Service specific error objects.
 */
class CustomErrorHandler {
    static MABError = MABError;

    static HTTP_STATUS_CODES = {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    };

    constructor(moduleName) {
        this.moduleName = moduleName;
    }

    /**
     * Throws a 400 Bad Request error with the specified message and detail.
     *
     * @param {string} message - The error message to be included in the Bad Request error.
     * @param {string} [detail] - Additional details about the error (optional).
     * @throws {MABError} Throws a 400 error with the provided message and detail.
     */
    throwBadRequestError(message, detail) {
        this._throwError(CustomErrorHandler.HTTP_STATUS_CODES.BAD_REQUEST, message, detail);
    }

    /**
     * Throws a 403 Forbidden error with the specified message and detail.
     *
     * @param {string} message - The error message to be included in the Forbidden error.
     * @param {string} [detail] - Additional details about the error (optional).
     * @throws {MABError} Throws a 403 error with the provided message and detail.
     */
    throwForbiddenError(message, detail) {
        this._throwError(CustomErrorHandler.HTTP_STATUS_CODES.FORBIDDEN, message, detail);
    }

    /**
     * Throws a 404 Not Found error with the specified message and detail.
     *
     * @param {string} message - The error message to be included in the Not Found error.
     * @param {string} [detail] - Additional details about the error (optional).
     * @throws {MABError} Throws a 404 error with the provided message and detail.
     */
    throwNotFoundError(message, detail) {
        this._throwError(CustomErrorHandler.HTTP_STATUS_CODES.NOT_FOUND, message, detail);
    }

    /**
     * Throws an internal error while logging the details of the provided error.
     * This method creates a generic 500 Internal Server Error to return to the client,
     * ensuring that sensitive error details are not exposed.
     *
     * @param {string} message - The error message.
     * @param {string} detail - Additional details about the error.
     * @param {string} stack - Stack trace of the error.
     * @throws {MABError} Throws a generic internal error after logging the details.
     */
    throwInternalError(message, detail, stack) {
        const genericInternalError = this._createInternalError();

        this._logError({
            status: genericInternalError.status,
            message: message,
            detail: detail,
            stack: stack
        });
        throw genericInternalError;
    }

    /**
     * Throws a ServiceNow WebService-specific error object created from a MABError or a generic error.
     * If the error is already a ServiceNow error, it is thrown directly.
     * Otherwise, it treats generic errors as unhandled exceptions, converts them to MABErrors,
     * and then to ServiceNow errors before throwing.
     *
     * @param {Error|MABError} error - Generic error object to convert into a ServiceNow WebService error.
     * @throws {sn_ws_err.ServiceError} Provided error if it is already a ServiceNow error.
     * @throws {sn_ws_err.ServiceError} New ServiceNow error object created from the input error if it is not a ServiceNow error.
     */
    throwSnWsError(error) {
        if (error instanceof sn_ws_err.ServiceError) {
            throw error;
        }
        const handledError = this.handleUncaughtException(error);
        throw this._createSnError(handledError);
    }

    /**
     * Handles an uncaught exception by logging the error and returning a generic internal error.
     *
     * @param {Error|MABError} error - Uncaught exception error object.
     * @returns {MABError} Generic internal error object.
     */
    handleUncaughtException(error) {
        if (error instanceof MABError) {
            return error;
        }
        // Uncaught exception
        const handledError = this._createInternalError();
        this._logError({
            status: handledError.status,
            message: error.message,
            stack: error.stack
        });
        return handledError;
    }

    /**
     * Creates and throws an error after logging its details.
     *
     * @param {number} status - HTTP status code or application-specific status for the error.
     * @param {string} [message] - Error message to be included in the error object (optional).
     * @param {string} [detail] - Additional details about the error (optional).
     * @throws {MABError} Constructed error.
     * @private
     */
    _throwError(status, message, detail) {
        const error = this._createError(status, message, detail);
        this._logError(error);
        throw error;
    }

    /**
     * Creates a ServiceNow WebService specific error object from a generic error.
     *
     * @param {Error} error - Generic error object to convert.
     * @returns {sn_ws_err.ServiceError} ServiceNow-specific error object.
     * @private
     */
    _createSnError(error) {
        const snError = new sn_ws_err.ServiceError();
        snError.setStatus(error.status);
        snError.setMessage(error.message);
        snError.setDetail(error.detail);
        return snError;
    }

    /**
     * Logs error details to the system's error logging service.
     * If specific error properties (status, message, detail) are not provided,
     * they will be excluded from the log to avoid unnecessary `undefined` values.
     *
     * @param {MABError} error - MABError object containing details to log.
     * @private
     */
    _logError(error) {
        const { status, message, detail, stack } = error;
        let errorMessage = `[${this.moduleName}]\n`;
        if (status) errorMessage += ` Status: ${status}\n`;
        if (message) errorMessage += ` Message: ${message}\n`;
        if (detail) errorMessage += ` Details: ${detail}\n`;
        if (status >= CustomErrorHandler.HTTP_STATUS_CODES
            .INTERNAL_SERVER_ERROR && stack) {
            errorMessage += `\nStack Trace:\n${stack}`;
        }
        gs.error(errorMessage.trim());
    }

    /**
     * Creates a new MABError object with a specified status, message, and detail.
     *
     * @param {number} status - HTTP status code or application-specific status for the error.
     * @param {string} message - Error message that describes the error.
     * @param {string} detail - Additional details about the error, providing more context.
     * @returns {MABError} Constructed error object with custom properties.
     * @private
     */
    _createError(status, message, detail) {
        return new CustomErrorHandler.MABError(message, status, detail);
    }

    /**
     * Creates a standard internal error object for server-related issues.
     *
     * @returns {MABError} Constructed internal error object.
     * @private
     */
    _createInternalError() {
        return this._createError(
            CustomErrorHandler.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            'INTERNAL_SERVER_ERROR',
            'An unexpected error occurred. Please try again later.'
        );
    }
}

module.exports = CustomErrorHandler;
