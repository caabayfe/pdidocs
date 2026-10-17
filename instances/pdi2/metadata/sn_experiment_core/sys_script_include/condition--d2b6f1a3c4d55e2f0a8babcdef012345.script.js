/**
 * Condition
 * Defines how multiple rules are combined in segment evaluation
 */
var Condition = Class.create();
Condition.prototype = {
    initialize: function() {
        // Not meant to be instantiated
    },

    type: 'Condition'
};

/**
 * All rules must evaluate to true
 */
Condition.AND = 'AND';

/**
 * At least one rule must evaluate to true
 */
Condition.OR = 'OR';

/**
 * Get all valid conditions
 * @returns {Array<String>} Array of valid condition values
 */
Condition.values = function() {
    return [
        Condition.AND,
        Condition.OR
    ];
};

/**
 * Check if a given string is a valid condition
 * @param {String} condition - Condition to validate
 * @returns {Boolean} True if valid
 */
Condition.isValid = function(condition) {
    return Condition.values().indexOf(condition) !== -1;
};
