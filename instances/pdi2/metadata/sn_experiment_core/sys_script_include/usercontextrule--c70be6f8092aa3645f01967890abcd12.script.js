/**
 * User Context Rule
 * Evaluates runtime user context attributes like device, browser, locale
 */
var UserContextRule = Class.create();
UserContextRule.prototype = Object.extendsObject(SegmentRule, {
    /**
     * Initialize user context rule
     * @param {String} field - Context field name
     * @param {String} operator - Operator value (comparison operator)
     * @param {*} value - Value to compare against
     * @param {String} alias - Rule alias (e.g., 'A', 'B', 'C')
     */
    initialize: function(field, operator, value, alias) {
        SegmentRule.prototype.initialize.call(this, CriteriaType.USER_CONTEXT, alias);
        this.field = field || null;
        this.operator = operator || null;
        this.value = value !== undefined ? value : null;
    },

    /**
     * Get the context field name
     * @returns {String} Field name
     */
    getField: function() {
        return this.field;
    },

    /**
     * Set the context field name
     * @param {String} field - Field name
     * @returns {UserContextRule} This instance for chaining
     */
    setField: function(field) {
        this.field = field;
        return this;
    },

    /**
     * Get the comparison operator
     * @returns {String} Operator value
     */
    getOperator: function() {
        return this.operator;
    },

    /**
     * Set the comparison operator
     * @param {String} operator - Operator value (comparison operator)
     * @returns {UserContextRule} This instance for chaining
     */
    setOperator: function(operator) {
        this.operator = operator;
        return this;
    },

    /**
     * Get the comparison value
     * @returns {*} Comparison value
     */
    getValue: function() {
        return this.value;
    },

    /**
     * Set the comparison value
     * @param {*} value - Comparison value
     * @returns {UserContextRule} This instance for chaining
     */
    setValue: function(value) {
        this.value = value;
        return this;
    },

    /**
     * Validate the rule structure
     * @returns {Object} Validation result {valid: Boolean, errors: Array<String>}
     */
    validate: function() {
        var errors = [];

        // Validate field
        if (!this.field || typeof this.field !== 'string' || this.field.trim() === '') {
            errors.push('field is required and must be a non-empty string');
        } else if (!UserContextField.isValid(this.field)) {
            errors.push('field must be a valid UserContextField: ' + this.field + ' (valid fields: ' + UserContextField.values().join(', ') + ')');
        }

        // Validate operator
        if (!this.operator) {
            errors.push('operator is required');
        } else if (!Operator.isValid(this.operator)) {
            errors.push('operator must be a valid operator');
        } else {
            // Validate value based on operator requirements
            if (Operator.requiresArray(this.operator)) {
                if (!Array.isArray(this.value)) {
                    errors.push('operator ' + this.operator + ' requires an array value');
                } else if (this.value.length === 0) {
                    errors.push('array value cannot be empty for operator ' + this.operator);
                }
            } else if (Operator.requiresNumeric(this.operator)) {
                if (typeof this.value !== 'number') {
                    errors.push('operator ' + this.operator + ' requires a numeric value');
                }
            }
        }

        // Validate value exists
        if (this.value === null || this.value === undefined) {
            errors.push('value is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Convert rule to JSON object
     * @returns {Object} JSON representation
     */
    toJSON: function() {
        var json = {
            ruleType: this.getRuleType(),
            alias: this.getAlias(),
            field: this.field,
            operator: this.operator,
            value: this.value
        };
        
        var meta = this.getMetadata();
        if (meta !== null && meta !== undefined) {
            json.metadata = meta;
        }
        
        return json;
    },

    type: 'UserContextRule'
});

/**
 * Create UserContextRule from JSON object
 * @param {Object} json - JSON object containing rule data
 * @returns {UserContextRule} New rule instance
 */
UserContextRule.fromJSON = function(json) {
    if (!json || json.ruleType !== CriteriaType.USER_CONTEXT) {
        throw new Error('Invalid UserContextRule JSON');
    }

    var rule = new UserContextRule();
    
    if (json.alias !== undefined) {
        rule.setAlias(json.alias);
    }
    if (json.field !== undefined) {
        rule.setField(json.field);
    }
    if (json.operator !== undefined) {
        rule.setOperator(json.operator);
    }
    if (json.value !== undefined) {
        rule.setValue(json.value);
    }
    if (json.metadata !== undefined) {
        rule.setMetadata(json.metadata);
    }

    return rule;
};
