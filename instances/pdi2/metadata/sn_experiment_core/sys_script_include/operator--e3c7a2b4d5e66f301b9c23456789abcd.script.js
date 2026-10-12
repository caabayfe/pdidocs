/**
 * Operator
 * Comparison operators used in segment criteria evaluation
 */
var Operator = Class.create();
Operator.prototype = {
    initialize: function() {
        // Not meant to be instantiated
    },

    type: 'Operator'
};

// ============================================================================
// Comparison Operators
// ============================================================================

/**
 * Exact equality comparison
 */
Operator.EQUALS = 'EQUALS';

/**
 * Negated equality comparison
 */
Operator.NOT_EQUALS = 'NOT_EQUALS';

/**
 * Value exists in a list
 */
Operator.IN = 'IN';

/**
 * Value does not exist in a list
 */
Operator.NOT_IN = 'NOT_IN';

/**
 * String contains substring
 */
Operator.CONTAINS = 'CONTAINS';

/**
 * String does not contain substring
 */
Operator.NOT_CONTAINS = 'NOT_CONTAINS';

/**
 * Numeric greater than comparison
 */
Operator.GREATER_THAN = 'GREATER_THAN';

/**
 * Numeric less than comparison
 */
Operator.LESS_THAN = 'LESS_THAN';

// ============================================================================
// Validation Methods
// ============================================================================

/**
 * Get all valid operators
 * @returns {Array<String>} Array of valid operator values
 */
Operator.values = function() {
    return [
        Operator.EQUALS,
        Operator.NOT_EQUALS,
        Operator.IN,
        Operator.NOT_IN,
        Operator.CONTAINS,
        Operator.NOT_CONTAINS,
        Operator.GREATER_THAN,
        Operator.LESS_THAN
    ];
};

/**
 * Check if a given string is a valid operator
 * @param {String} operator - Operator to validate
 * @returns {Boolean} True if valid
 */
Operator.isValid = function(operator) {
    return Operator.values().indexOf(operator) !== -1;
};

/**
 * Check if operator requires array value
 * @param {String} operator - Operator to check
 * @returns {Boolean} True if requires array
 */
Operator.requiresArray = function(operator) {
    return operator === Operator.IN || operator === Operator.NOT_IN;
};

/**
 * Check if operator requires numeric value
 * @param {String} operator - Operator to check
 * @returns {Boolean} True if requires numeric value
 */
Operator.requiresNumeric = function(operator) {
    return operator === Operator.GREATER_THAN || operator === Operator.LESS_THAN;
};
