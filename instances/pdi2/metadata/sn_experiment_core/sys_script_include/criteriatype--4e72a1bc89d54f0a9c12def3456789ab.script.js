/**
 * Enum for Segment Criteria Types
 * Defines the types of targeting criteria supported in segment evaluation
 */
var CriteriaType = Class.create();
CriteriaType.prototype = {
    initialize: function() {
        // Not meant to be instantiated
    },

    type: 'CriteriaType'
};

/**
 * Reference to existing ServiceNow User Criteria object
 */
CriteriaType.USER_CRITERIA = 'USER_CRITERIA';

/**
 * Runtime user context criteria (device, browser, etc.)
 */
CriteriaType.USER_CONTEXT = 'USER_CONTEXT';

/**
 * Historical usage-based criteria
 */
CriteriaType.USAGE_CRITERIA = 'USAGE_CRITERIA';

/**
 * Get all valid criteria types
 * @returns {Array<String>} Array of valid criteria type values
 */
CriteriaType.values = function() {
    return [
        CriteriaType.USER_CRITERIA,
        CriteriaType.USER_CONTEXT,
        CriteriaType.USAGE_CRITERIA
    ];
};

/**
 * Check if a given string is a valid criteria type
 * @param {String} type - Type to validate
 * @returns {Boolean} True if valid
 */
CriteriaType.isValid = function(type) {
    return CriteriaType.values().indexOf(type) !== -1;
};
