/**
 * UserContextEvaluator
 * Evaluates USER_CONTEXT rules based on runtime user context
 */
var UserContextEvaluator = Class.create();
UserContextEvaluator.prototype = {
    /**
     * Initialize the evaluator
     */
    initialize: function() {
        // No initialization needed
    },

    /**
     * Evaluate a user context rule
     * @param {UserContextRule} rule - User context rule to evaluate
     * @param {Object} context - User context containing runtime attributes
     * @returns {Boolean} True if context matches the rule
     */
    evaluate: function(rule, context) {
        var field = rule.getField();
        var operator = rule.getOperator();
        var expectedValue = rule.getValue();

        // Get actual value from context (no validation/logging on hot path)
        var actualValue = this._getContextValue(field, context);
        if (actualValue === null || actualValue === undefined) {
            return false;
        }

        // Evaluate based on operator
        return this._evaluateOperator(actualValue, operator, expectedValue);
    },

    /**
     * Get value from context by field name
     * @private
     * @param {String} field - Field name
     * @param {Object} context - User context
     * @returns {*} Field value or null
     */
    _getContextValue: function(field, context) {
        // Check if context has the field directly
        if (context.hasOwnProperty(field)) {
            return context[field];
        }

        // Check nested userContext object
        if (context.userContext && context.userContext.hasOwnProperty(field)) {
            return context.userContext[field];
        }

        return null;
    },

    /**
     * Evaluate operator comparison
     * @private
     * @param {*} actualValue - Actual value from context
     * @param {String} operator - Operator to apply
     * @param {*} expectedValue - Expected value from rule
     * @returns {Boolean} True if comparison matches
     */
    _evaluateOperator: function(actualValue, operator, expectedValue) {
        switch (operator) {
            case Operator.EQUALS:
                return this._equals(actualValue, expectedValue);

            case Operator.NOT_EQUALS:
                return !this._equals(actualValue, expectedValue);

            case Operator.IN:
                return this._in(actualValue, expectedValue);

            case Operator.NOT_IN:
                return !this._in(actualValue, expectedValue);

            case Operator.CONTAINS:
                return this._contains(actualValue, expectedValue);

            case Operator.NOT_CONTAINS:
                return !this._contains(actualValue, expectedValue);

            case Operator.GREATER_THAN:
                return this._greaterThan(actualValue, expectedValue);

            case Operator.LESS_THAN:
                return this._lessThan(actualValue, expectedValue);

            default:
                return false;
        }
    },

    /**
     * Equals comparison
     * @private
     */
    _equals: function(actual, expected) {
        // Case-insensitive string comparison
        if (typeof actual === 'string' && typeof expected === 'string') {
            return actual.toLowerCase() === expected.toLowerCase();
        }
        return actual === expected;
    },

    /**
     * IN comparison (value in array)
     * @private
     */
    _in: function(actual, expected) {
        if (!Array.isArray(expected)) {
            return false;
        }

        // Case-insensitive for strings
        if (typeof actual === 'string') {
            var actualLower = actual.toLowerCase();
            for (var i = 0; i < expected.length; i++) {
                if (typeof expected[i] === 'string' && expected[i].toLowerCase() === actualLower) {
                    return true;
                }
            }
            return false;
        }

        return expected.indexOf(actual) !== -1;
    },

    /**
     * CONTAINS comparison (substring match)
     * @private
     */
    _contains: function(actual, expected) {
        if (typeof actual !== 'string' || typeof expected !== 'string') {
            return false;
        }
        return actual.toLowerCase().indexOf(expected.toLowerCase()) !== -1;
    },

    /**
     * GREATER_THAN comparison
     * @private
     */
    _greaterThan: function(actual, expected) {
        var actualNum = parseFloat(actual);
        var expectedNum = parseFloat(expected);
        if (isNaN(actualNum) || isNaN(expectedNum)) {
            return false;
        }

        return actualNum > expectedNum;
    },

    /**
     * LESS_THAN comparison
     * @private
     */
    _lessThan: function(actual, expected) {
        var actualNum = parseFloat(actual);
        var expectedNum = parseFloat(expected);
        if (isNaN(actualNum) || isNaN(expectedNum)) {
            return false;
        }

        return actualNum < expectedNum;
    },

    type: 'UserContextEvaluator'
};
