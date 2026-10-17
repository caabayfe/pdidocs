/**
 * RuntimeError
 * Represents a failure in an operation, wrapping the original cause.
 *
 * Usage:
 *   try {
 *     // some operation
 *   } catch (e) {
 *     throw new RuntimeError('The operation failed', e);
 *   }
 */
var RuntimeError = Class.create();
RuntimeError.prototype = Object.extendsObject(Error, {
    /**
     * Constructor.
     * @param {string} [message] - The primary error message.
     * @param {Error} [cause] - The original error that caused this one.
     */
    initialize: function(message, cause) {
        Object.defineProperty(this, 'name', {
            value: 'RuntimeError',
            configurable: true,
            writable: true,
            enumerable: false
        });

        this.message = String(message || 'Operation failed');
        this.cause = cause;

        // Build a more detailed stack trace if the cause is available
        var stack = (cause && cause.stack) ? cause.stack : (new Error()).stack;
        this.stack = this.name + ': ' + this.message + '\n' + stack;
    },

    /**
     * Returns a string representation of the error.
     * @returns {string} The error as a formatted string.
     */
    toString: function() {
        var str = "RuntimeError: " + this.message;
        if (this.cause) {
            str += " (caused by: " + this.cause.toString() + ")";
        }
        return str;
    },

    type: 'RuntimeError'
});
