/**
 * UserCriteriaEvaluator
 * Evaluates USER_CRITERIA rules by delegating to ServiceNow User Criteria API
 */
var UserCriteriaEvaluator = Class.create();
UserCriteriaEvaluator.prototype = {
    /**
     * Initialize the evaluator
     */
    initialize: function() {
    },

    /**
     * Evaluate a user criteria rule
     * @param {UserCriteriaRule} rule - User criteria rule to evaluate
     * @param {Object} context - User context containing userId, userRecord, and userContext
     * @returns {Boolean} True if user matches the criteria
     */
    evaluate: function(rule, context) {
        var criteriaSysId = rule.getCriteriaSysId();
        var userSysId = (context && context.userId) ? context.userId : gs.getUserID();
        return sn_uc.UserCriteriaLoader.userMatches(userSysId, [criteriaSysId]) === true;
    },

    type: 'UserCriteriaEvaluator'
};
