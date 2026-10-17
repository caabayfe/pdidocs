/**
 * EvaluatorFactory
 * Provides evaluator instances for different rule types with lazy init
 */
var EvaluatorFactory = Class.create();
EvaluatorFactory.prototype = {
    initialize: function() {
        // Lazy singletons
        this.ucCriteria = null;   // UserCriteriaEvaluator
        this.ucContext = null;    // UserContextEvaluator
        this.usage = null;        // UsageCriteriaEvaluator (placeholder)
    },

    /**
     * Get evaluator instance for a given CriteriaType
     * @param {String} criteriaType - One of CriteriaType.USER_CRITERIA, USER_CONTEXT, USAGE_CRITERIA
     * @returns {Object} Evaluator instance with evaluate(rule, context) -> Boolean
     */
    getEvaluator: function(criteriaType) {
        switch (criteriaType) {
            case CriteriaType.USER_CRITERIA:
                if (!this.ucCriteria) this.ucCriteria = new UserCriteriaEvaluator();
                return this.ucCriteria;
            case CriteriaType.USER_CONTEXT:
                if (!this.ucContext) this.ucContext = new UserContextEvaluator();
                return this.ucContext;
            case CriteriaType.USAGE_CRITERIA:
                if (!this.usage) this.usage = new UsageCriteriaEvaluator();
                return this.usage;
            default:
                return null;
        }
    },

    type: 'EvaluatorFactory'
};
