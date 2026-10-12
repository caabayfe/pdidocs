/**
 * Segment
 * Represents a user segment with targeting criteria for experiment participation
 */
var Segment = Class.create();
Segment.prototype = {
    /**
     * Initialize segment
     * @param {String} sysId - System ID of the segment
     * @param {String} name - Name of the segment
     */
    initialize: function(sysId, name) {
        this.sysId = sysId || null;
        this.name = name || null;
        // Single criteria wrapper to mirror DB model
        this.criteria = {
            condition: Condition.AND,
            rules: []
        };
    },

    /**
     * Get the system ID
     * @returns {String} System ID
     */
    getSysId: function() {
        return this.sysId;
    },

    /**
     * Set the system ID
     * @param {String} sysId - System ID
     * @returns {Segment} This instance for chaining
     */
    setSysId: function(sysId) {
        this.sysId = sysId;
        return this;
    },

    /**
     * Get the segment name
     * @returns {String} Name
     */
    getName: function() {
        return this.name;
    },

    /**
     * Set the segment name
     * @param {String} name - Name
     * @returns {Segment} This instance for chaining
     */
    setName: function(name) {
        this.name = name;
        return this;
    },

    /**
     * Get the condition for combining rules
     * @returns {String} Condition value (AND or OR)
     */
    getCondition: function() {
        return this.criteria.condition;
    },

    /**
     * Set the condition for combining rules
     * @param {String} condition - Condition value (AND or OR)
     * @returns {Segment} This instance for chaining
     */
    setCondition: function(condition) {
        this.criteria.condition = condition;
        return this;
    },

    /**
     * Get all rules
     * @returns {Array<SegmentRule>} Array of segment rules
     */
    getRules: function() {
        return this.criteria.rules;
    },

    /**
     * Set all rules (replaces existing rules)
     * @param {Array<SegmentRule>} rules - Array of segment rules
     * @returns {Segment} This instance for chaining
     */
    setRules: function(rules) {
        this.criteria.rules = rules || [];
        return this;
    },

    /**
     * Add a single rule
     * @param {SegmentRule} rule - Rule to add
     * @returns {Segment} This instance for chaining
     */
    addRule: function(rule) {
        if (SegmentRule.isValidRule(rule)) {
            // Auto-assign alias if not set (A, B, C, ...)
            if (!rule.getAlias()) {
                var alias = this._generateNextAlias();
                rule.setAlias(alias);
            }
            this.criteria.rules.push(rule);
        } else {
            throw new Error('Rule must implement SegmentRule interface');
        }
        return this;
    },

    /**
     * Generate next alias for a rule (A, B, C, ..., Z, AA, AB, ...)
     * @private
     * @returns {String} Next available alias
     */
    _generateNextAlias: function() {
        var index = this.criteria.rules.length;
        var alias = '';
        
        // Convert index to base-26 letter system (A=0, B=1, ..., Z=25, AA=26, ...)
        do {
            alias = String.fromCharCode(65 + (index % 26)) + alias;
            index = Math.floor(index / 26) - 1;
        } while (index >= 0);
        
        return alias;
    },

    /**
     * Remove a rule at specific index
     * @param {Number} index - Index of rule to remove
     * @returns {Segment} This instance for chaining
     */
    removeRule: function(index) {
        var rules = this.criteria.rules;
        if (index >= 0 && index < rules.length) {
            rules.splice(index, 1);
        }
        return this;
    },

    /**
     * Clear all rules
     * @returns {Segment} This instance for chaining
     */
    clearRules: function() {
        this.criteria.rules = [];
        return this;
    },

    /**
     * Get rule count
     * @returns {Number} Number of rules
     */
    getRuleCount: function() {
        return this.criteria.rules.length;
    },

    /**
     * Validate the segment structure
     * @returns {Object} Validation result {valid: Boolean, errors: Array<String>}
     */
    validate: function() {
        var errors = [];

        // Validate name
        if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
            errors.push('Segment name is required');
        }

        // Validate condition
        if (!Condition.isValid(this.criteria.condition)) {
            errors.push('Invalid condition: ' + this.criteria.condition);
        }

        // Validate rules exist
        if (!this.criteria.rules || this.criteria.rules.length === 0) {
            errors.push('At least one rule is required');
        } else {
            // Validate each rule
            for (var i = 0; i < this.criteria.rules.length; i++) {
                var rule = this.criteria.rules[i];
                var ruleValidation = rule.validate();
                
                if (!ruleValidation.valid) {
                    for (var j = 0; j < ruleValidation.errors.length; j++) {
                        errors.push('Rule ' + i + ': ' + ruleValidation.errors[j]);
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Convert segment to JSON object
     * @returns {Object} JSON representation
     */
    toJSON: function() {
        var rulesJson = [];
        var rules = this.criteria.rules;
        for (var i = 0; i < rules.length; i++) {
            rulesJson.push(rules[i].toJSON());
        }

        return {
            sysId: this.sysId,
            name: this.name,
            criteria: {
                condition: this.criteria.condition,
                rules: rulesJson
            }
        };
    },

    /**
     * Get criteria JSON (matches DB schema)
     * @returns {Object} Criteria JSON object
     */
    getCriteriaJSON: function() {
        var rulesJson = [];
        var rules = this.criteria.rules;
        for (var i = 0; i < rules.length; i++) {
            rulesJson.push(rules[i].toJSON());
        }

        return {
            condition: this.criteria.condition,
            rules: rulesJson
        };
    },

    /**
     * Alias returning criteria wrapper (mimics record field)
     * @returns {Object} Criteria JSON { operator, rules }
     */
    getCriteria: function() {
        return this.getCriteriaJSON();
    },

    type: 'Segment'
};

/**
 * Create Segment from JSON object
 * @param {Object} json - JSON object containing segment data
 * @returns {Segment} New segment instance
 */
Segment.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid segment JSON: expected an object');
    }

    var segment = new Segment();

    // Set basic properties
    if (json.sysId !== undefined) {
        segment.setSysId(json.sysId);
    }
    if (json.name !== undefined) {
        segment.setName(json.name);
    }
    
    // Parse criteria
    if (json.criteria) {
        var criteria = json.criteria;

        if (typeof criteria === 'string') {
            try {
                criteria = JSON.parse(criteria);
            } catch (e) {
                throw new Error('Failed to parse criteria for segment: ' + e.message);
            }
        }

        if (criteria && typeof criteria === 'object') {
            // Set condition
            if (criteria.condition !== undefined) {
                segment.setCondition(criteria.condition);
            }

            // Parse rules
            if (Array.isArray(criteria.rules)) {
                for (var i = 0; i < criteria.rules.length; i++) {
                    try {
                        var rule = SegmentRule.fromJSON(criteria.rules[i]);
                        segment.addRule(rule);
                    } catch (e) {
                        throw new Error('Failed to parse rule ' + i + ': ' + e.message);
                    }
                }
            }
        }
    }

    return segment;
};

/**
 * Create Segment from database record
 * @param {GlideRecord} gr - GlideRecord from sn_experiment_core_segment table
 * @returns {Segment} New segment instance
 */
Segment.fromGlideRecord = function(gr) {
    if (!gr || !gr.isValidRecord()) {
        throw new Error('Invalid GlideRecord');
    }

    var segment = new Segment();
    segment.setSysId(gr.getValue('sys_id'));
    segment.setName(gr.getValue('name'));

    // Parse criteria JSON
    var criteriaStr = gr.getValue('criteria');
    if (criteriaStr) {
        try {
            var criteria = JSON.parse(criteriaStr);
            
            // Set condition
            if (criteria.condition) {
                segment.setCondition(criteria.condition);
            }

            // Parse rules
            if (Array.isArray(criteria.rules)) {
                for (var i = 0; i < criteria.rules.length; i++) {
                    try {
                        var rule = SegmentRule.fromJSON(criteria.rules[i]);
                        segment.addRule(rule);
                    } catch (e) {
                        gs.error('Failed to parse rule ' + i + ' for segment ' + segment.getSysId() + ': ' + e.message);
                    }
                }
            }
        } catch (e) {
            gs.error('Failed to parse criteria JSON for segment ' + segment.getSysId() + ': ' + e.message);
        }
    }

    return segment;
};
