/**
 * SegmentEvaluator
 * Evaluates whether a user matches segment criteria
 */
var SegmentEvaluator = Class.create();
SegmentEvaluator.prototype = {
    /**
     * Initialize the evaluator
     */
    initialize: function() {
        this.factory = new EvaluatorFactory();
    },

    /**
     * Evaluate if a user matches the segment criteria
     * @param {Segment} segment - Segment to evaluate
     * @param {Object} context - User context containing user info and runtime context
     * @returns {Object} Evaluation result {matches: Boolean}
     */
    evaluate: function(segment, context) {
        try {
            var rules = segment.getRules();
            var condition = segment.getCondition();

            // Fast path: single rule
            if (rules.length === 1) {
                return { matches: this._evaluateRule(rules[0], context) };
            }

            // Multi-rule short-circuit
            for (var i = 0; i < rules.length; i++) {
                var ruleMatches = this._evaluateRule(rules[i], context);
                if (condition === Condition.AND && !ruleMatches) return { matches: false };
                if (condition === Condition.OR && ruleMatches) return { matches: true };
            }

            // If AND and none failed -> true. If OR and none matched -> false
            return { matches: (condition === Condition.AND) };

        } catch (e) {
            // Minimal logging for performance-sensitive path
            gs.error('SegmentEvaluator error for sysId: ' + segment.getSysId() + 'message: ' +  e.message);
            return { matches: false };
        }
    },

    /**
     * Evaluate a single rule
     * @private
     * @param {SegmentRule} rule - Rule to evaluate
     * @param {Object} context - User context
     * @returns {Boolean} True if rule matches
     */
    _evaluateRule: function(rule, context) {
        var ruleType = rule.getRuleType();
        var evaluator = this.factory.getEvaluator(ruleType);
        return evaluator ? evaluator.evaluate(rule, context) : false;
    },

    type: 'SegmentEvaluator'
};
