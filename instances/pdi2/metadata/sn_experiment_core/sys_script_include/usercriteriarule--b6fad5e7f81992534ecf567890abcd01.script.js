/**
 * User Criteria Rule
 * References an existing ServiceNow User Criteria object for evaluation
 */
var UserCriteriaRule = Class.create();
UserCriteriaRule.prototype = Object.extendsObject(SegmentRule, {
    /**
     * Initialize user criteria rule
     * @param {String} criteriaSysId - sys_id of the User Criteria record
     * @param {String} alias - Rule alias (e.g., 'A', 'B', 'C')
     */
    initialize: function(criteriaSysId, alias) {
        SegmentRule.prototype.initialize.call(this, CriteriaType.USER_CRITERIA, alias);
        this.criteriaSysId = criteriaSysId || null;
    },

    /**
     * Get the criteria sys_id
     * @returns {String} User Criteria sys_id
     */
    getCriteriaSysId: function() {
        return this.criteriaSysId;
    },

    /**
     * Set the criteria sys_id
     * @param {String} criteriaSysId - User Criteria sys_id
     * @returns {UserCriteriaRule} This instance for chaining
     */
    setCriteriaSysId: function(criteriaSysId) {
        this.criteriaSysId = criteriaSysId;
        return this;
    },

    /**
     * Validate the rule structure
     * @returns {Object} Validation result {valid: Boolean, errors: Array<String>}
     */
    validate: function() {
        var errors = [];

        if (!this.criteriaSysId || typeof this.criteriaSysId !== 'string' || this.criteriaSysId.trim() === '') {
            errors.push('criteriaSysId is required and must be a non-empty string');
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
            criteriaSysId: this.criteriaSysId
        };
        
        var meta = this.getMetadata();
        if (meta !== null && meta !== undefined) {
            json.metadata = meta;
        }
        
        return json;
    },

    type: 'UserCriteriaRule'
});

/**
 * Create UserCriteriaRule from JSON object
 * @param {Object} json - JSON object containing rule data
 * @returns {UserCriteriaRule} New rule instance
 */
UserCriteriaRule.fromJSON = function(json) {
    if (!json || json.ruleType !== CriteriaType.USER_CRITERIA) {
        throw new Error('Invalid UserCriteriaRule JSON');
    }

    var rule = new UserCriteriaRule();
    
    if (json.alias !== undefined) {
        rule.setAlias(json.alias);
    }
    if (json.criteriaSysId !== undefined) {
        rule.setCriteriaSysId(json.criteriaSysId);
    }
    if (json.metadata !== undefined) {
        rule.setMetadata(json.metadata);
    }

    return rule;
};
