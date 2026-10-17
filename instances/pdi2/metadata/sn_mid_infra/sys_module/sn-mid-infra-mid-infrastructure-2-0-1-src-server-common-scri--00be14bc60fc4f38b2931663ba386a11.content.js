/**
 * DatabaseQueryUtility class for common database query-related utility functions.
 */
var DatabaseQueryUtility = Class.create();
DatabaseQueryUtility.prototype = {
    initialize: function() {
        this.validationUtil = undefined;
    },

    /**
     * Sanitizes a string for safe use in CONTAINS queries by escaping SQL wildcards.
     * This prevents wildcard injection where users could exploit % and _ characters
     * to match unintended records.
     * 
     * @param {string} input - The input string to sanitize
     * @returns {string|null} The sanitized string, or null if the input is null/undefined.
     * @throws {InvalidValueError} When input is provided but is not a string
     * 
     * @example
     * var dbQueryUtil = new DatabaseQueryUtility();
     * var sanitized = dbQueryUtil.sanitizeForContainsQuery('user_name%test');
     * // Returns: 'user\\_name\\%test'
     */
    sanitizeForContainsQuery: function(input) {
        // Validate that input is a string (allows null and undefined)
        this._getValidationUtil().validateString(input, 'input', true);
        
        // If input is null or undefined, return null for consistency.
        if (input == null) {
            return null;
        }
        
        return input
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/%/g, '\\%')    // Escape % wildcard
            .replace(/_/g, '\\_');   // Escape _ wildcard
    },

    _getValidationUtil: function() {
        if (this.validationUtil === undefined) {
            this.validationUtil = new ValidationUtility();
        }
        return this.validationUtil;
    },

    type: 'DatabaseQueryUtility'
};
