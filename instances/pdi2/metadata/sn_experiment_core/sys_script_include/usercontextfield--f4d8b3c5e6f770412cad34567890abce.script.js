/**
 * UserContextField
 * Enum for valid user context fields that can be used in USER_CONTEXT rules
 */
var UserContextField = Class.create();
UserContextField.prototype = {
    initialize: function() {
        // Not meant to be instantiated
    },

    type: 'UserContextField'
};

/**
 * Device type (desktop, mobile, tablet)
 */
UserContextField.DEVICE_TYPE = 'device_type';

/**
 * Browser name (Chrome, Firefox, Safari, Edge, etc.)
 */
UserContextField.BROWSER = 'browser';

/**
 * Operating system (Windows, macOS, Linux, iOS, Android, etc.)
 */
UserContextField.OS = 'os';

/**
 * Get all valid user context fields
 * @returns {Array<String>} Array of valid field names
 */
UserContextField.values = function() {
    return [
        UserContextField.DEVICE_TYPE,
        UserContextField.BROWSER,
        UserContextField.OS
    ];
};

/**
 * Check if a given string is a valid user context field
 * @param {String} field - Field name to validate
 * @returns {Boolean} True if valid
 */
UserContextField.isValid = function(field) {
    return UserContextField.values().indexOf(field) !== -1;
};

/**
 * Get display name for a field
 * @param {String} field - Field name
 * @returns {String} Display name
 */
UserContextField.getDisplayName = function(field) {
    var displayNames = {
        'device_type': 'Device Type',
        'browser': 'Browser',
        'os': 'Operating System'
    };
    return displayNames[field] || field;
};
