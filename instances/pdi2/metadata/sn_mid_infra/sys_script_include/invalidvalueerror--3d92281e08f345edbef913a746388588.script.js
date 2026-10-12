/**
 * InvalidValueError
 *
 * Usage:
 *   throw new InvalidValueError('Expected non-empty string for key');
 */
var InvalidValueError = Class.create();
InvalidValueError.prototype =  Object.extendsObject(Error, {
    /**
     * Initializes the InvalidValueError.
     * @param {string} [message] - The error message
     */
    initialize: function(message) {

        Object.defineProperty(this, 'name', {
            value: 'InvalidValueError',
            configurable: true,
            writable: true,
            enumerable: false
        });
        this.message = String(message || 'Invalid argument type');

        // Capture stack trace for easier debugging where supported
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidValueError);
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
        return "InvalidValueError: " + this.message;
    },

    type: 'InvalidValueError'
});
