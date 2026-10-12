/**
 * ResourceNotFoundError
 *
 * Thrown when a requested record, resource, or entity cannot be found in the system.
 * This is typically used for database lookups, file retrieval, or API resource access
 * where the identifier is valid but no matching entity exists.
 *
 * Usage:
 *   throw new ResourceNotFoundError('Certificate mapping not found for agent sys_id: ' + sysId);
 */
var ResourceNotFoundError = Class.create();
ResourceNotFoundError.prototype =  Object.extendsObject(Error, {
    /**
     * Initializes the ResourceNotFoundError.
     * @param {string} [message] - The error message
     */
    initialize: function(message) {
        Object.defineProperty(this, 'name', {
            value: 'ResourceNotFoundError',
            configurable: true,
            writable: true,
            enumerable: false
        });
        this.message = String(message || 'Resource not found');

        // Capture stack trace for easier debugging where supported
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, ResourceNotFoundError);
        } else {
            try {
                this.stack = (new Error(this.message)).stack;
            } catch (e) {
                // Stack capture not supported; ignore
            }
        }
    },

    /**
     * Returns a string representation of the error.
     * @returns {string} The error as a formatted string
     */
    toString: function () {
        return "ResourceNotFoundError: " + this.message;
    },

    type: 'ResourceNotFoundError'
});
