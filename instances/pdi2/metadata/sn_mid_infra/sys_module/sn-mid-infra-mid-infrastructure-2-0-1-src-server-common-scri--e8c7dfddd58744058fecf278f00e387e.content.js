/**
 * InvalidStateError
 *
 * Thrown when the system or environment is in an unexpected or invalid state
 * (e.g., missing certificates, failed inserts, unavailable dependencies), as
 * opposed to caller input mistakes. Use this to distinguish operational/system
 * failures from invalid argument errors.
 */
var InvalidStateError = Class.create();
InvalidStateError.prototype =  Object.extendsObject(Error, {
    /**
     * Initializes the InvalidStateError.
     * @param {string} [message] - The error message
     */
    initialize: function(message) {
        Object.defineProperty(this, 'name', {
            value: 'InvalidStateError',
            configurable: true,
            writable: true,
            enumerable: false
        });
        this.message = String(message || 'Invalid system state');

        // Capture stack trace for easier debugging where supported
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidStateError);
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
        return "InvalidStateError: " + this.message;
    },

    type: 'InvalidStateError'
});
