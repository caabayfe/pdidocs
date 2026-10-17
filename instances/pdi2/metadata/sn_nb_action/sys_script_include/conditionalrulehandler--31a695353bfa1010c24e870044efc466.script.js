var ConditionalRuleHandler = Class.create();
ConditionalRuleHandler.prototype = Object.extendsObject(sn_nb_action.RuleTypeHandlerBase, {
    initialize: function() {},

    /*
     * This identifies the rule type handled by this implementation.
     * Should be name of a table that extends "sn_nb_action_rule_base" table.
     */
    getId: function() {
        return sn_nb_action.Constants.TBL_CONDITIONAL_RULE;
    },

    /*
     * Return an array of GlideRecord actions recommended by this rule
     */
    evaluateRule: function(currentRecord, ruleRecord) {
        var actions = [];
        var roles = [];
        var actionInputs = [];
        var recommendedActions = [];
        var condition = ruleRecord.getValue(sn_nb_action.Constants.COL_CONDITION);
        if (condition && !gs.nil(condition)) {
            var name = ruleRecord.getValue(sn_nb_action.Constants.COL_NAME);
            var filter = new GlideFilter(condition, name);
            filter.setCaseSensitive(false);
            if (filter.match(currentRecord, true)) {
                var action = ruleRecord[sn_nb_action.Constants.COL_RECOMMEND].getRefRecord();
                var recommendedAction = sn_nb_action.RecommendedAction.createFromRule(action, new Object(), ruleRecord.getValue(sn_nb_action.Constants.COL_ROLES));
                recommendedActions.push(recommendedAction);
            }
        }
        return recommendedActions;
    },

    /*
     * Returns true if the action is allowed for selected table
     */
    isValidRule: function(ruleRecord) {
        var actionRecord = ruleRecord[sn_nb_action.Constants.COL_RECOMMEND].getRefRecord();
        var tableName = ruleRecord[sn_nb_action.Constants.COL_RULE_CONTEXT][sn_nb_action.Constants.COL_CONTEXT];
        return new sn_nb_action.NextBestActionService().isActionAllowed(tableName, actionRecord);
    },

    type: 'ConditionalRuleHandler'
});
