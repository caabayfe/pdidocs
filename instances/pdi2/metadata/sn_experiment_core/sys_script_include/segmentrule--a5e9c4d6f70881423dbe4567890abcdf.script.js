/**
 * Base class for Segment Criteria Rules
 * Abstract base class for all rule types in segment evaluation
 */
var SegmentRule = Class.create();
SegmentRule.prototype = {
    /**
     * Initialize base rule with type
     * @param {String} type - CriteriaType value
     * @param {String} alias - Rule alias (e.g., 'A', 'B', 'C')
     */
    initialize: function(type, alias) {
        this.ruleType = type;
        this.alias = alias || null;
        this.metadata = null;
    },

    /**
     * Get the criteria type
     * @returns {String} CriteriaType value
     */
    // New descriptive API
    getRuleType: function() {
        return this.ruleType;
    },

    /**
     * Set the criteria type
     * @param {String} type - CriteriaType value
     * @returns {SegmentRule} This instance for chaining
     */
    setRuleType: function(type) {
        this.ruleType = type;
        return this;
    },


    /**
     * Get the rule alias
     * @returns {String} Rule alias
     */
    getAlias: function() {
        return this.alias;
    },

    /**
     * Set the rule alias
     * @param {String} alias - Rule alias (e.g., 'A', 'B', 'C')
     * @returns {SegmentRule} This instance for chaining
     */
    setAlias: function(alias) {
        this.alias = alias;
        return this;
    },

    /**
     * Get the rule metadata
     * @returns {Object} Rule metadata (JSON object)
     */
    getMetadata: function() {
        return this.metadata;
    },

    /**
     * Set the rule metadata
     * @param {Object} metadata - Arbitrary JSON metadata
     * @returns {SegmentRule} This instance for chaining
     */
    setMetadata: function(metadata) {
        this.metadata = metadata;
        return this;
    },

    /**
     * Validate the rule structure
     * Must be implemented by subclasses
     * @returns {Object} Validation result {valid: Boolean, errors: Array<String>}
     */
    validate: function() {
        throw new Error('validate() must be implemented by subclass');
    },

    /**
     * Convert rule to JSON object
     * Must be implemented by subclasses
     * @returns {Object} JSON representation
     */
    toJSON: function() {
        throw new Error('toJSON() must be implemented by subclass');
    },

    type: 'SegmentRule'
};

/**
 * Create a SegmentRule from JSON object
 * Factory method to instantiate appropriate rule subclass
 * @param {Object} json - JSON object containing rule data
 * @returns {SegmentRule} Appropriate rule instance
 */
SegmentRule.fromJSON = function(json) {
    if (!json || !json.ruleType) {
        throw new Error('Invalid rule JSON: missing ruleType');
    }

    var ruleType = json.ruleType;

    if (ruleType === CriteriaType.USER_CRITERIA) {
        return UserCriteriaRule.fromJSON(json);
    } else if (ruleType === CriteriaType.USER_CONTEXT) {
        return UserContextRule.fromJSON(json);
    } else if (ruleType === CriteriaType.USAGE_CRITERIA) {
        return UsageCriteriaRule.fromJSON(json);
    } else {
        throw new Error('Unknown rule type: ' + ruleType);
    }
};

/**
 * Static validation that checks an object's conformance by invoking
 * polymorphic methods and validating their return values. This avoids
 * instanceof and function-type checks.
 * @param {*} obj
 * @returns {Boolean}
 */
SegmentRule.isValidRule = function(obj) {
    // Single try/catch for robustness and simplicity
    try {
        var t = obj && obj.getRuleType && obj.getRuleType();
        return !!t && CriteriaType.isValid(t) === true;
    } catch (e) {
        return false;
    }
};
