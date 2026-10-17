/**
 * Usage Criteria Rule
 * Evaluates historical usage data using a DSL query string
 */
var UsageCriteriaRule = Class.create();
UsageCriteriaRule.prototype = Object.extendsObject(SegmentRule, {
    /**
     * Initialize usage criteria rule
     * @param {String} query - DSL query string
     * @param {String} alias - Rule alias (e.g., 'A', 'B', 'C')
     */
    initialize: function(query, alias) {
        SegmentRule.prototype.initialize.call(this, CriteriaType.USAGE_CRITERIA, alias);
        this.query = query || null;
    },

    /**
     * Get the DSL query string
     * @returns {String} Query string
     */
    getQuery: function() {
        return this.query;
    },

    /**
     * Set the DSL query string
     * @param {String} query - Query string
     * @returns {UsageCriteriaRule} This instance for chaining
     */
    setQuery: function(query) {
        this.query = query;
        return this;
    },

    /**
     * Validate the rule structure
     * @returns {Object} Validation result {valid: Boolean, errors: Array<String>}
     */
    validate: function() {
        var errors = [];

        if (!this.query || typeof this.query !== 'string' || this.query.trim() === '') {
            errors.push('query is required and must be a non-empty string');
        }

        // Note: DSL query syntax validation is delegated to the usage criteria engine

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
            query: this.query
        };
        
        var meta = this.getMetadata();
        if (meta !== null && meta !== undefined) {
            json.metadata = meta;
        }
        
        return json;
    },

    type: 'UsageCriteriaRule'
});

/**
 * Create UsageCriteriaRule from JSON object
 * @param {Object} json - JSON object containing rule data
 * @returns {UsageCriteriaRule} New rule instance
 */
UsageCriteriaRule.fromJSON = function(json) {
    if (!json || json.ruleType !== CriteriaType.USAGE_CRITERIA) {
        throw new Error('Invalid UsageCriteriaRule JSON');
    }

    var rule = new UsageCriteriaRule();
    
    if (json.alias !== undefined) {
        rule.setAlias(json.alias);
    }
    if (json.query !== undefined) {
        rule.setQuery(json.query);
    }
    if (json.metadata !== undefined) {
        rule.setMetadata(json.metadata);
    }

    return rule;
};
