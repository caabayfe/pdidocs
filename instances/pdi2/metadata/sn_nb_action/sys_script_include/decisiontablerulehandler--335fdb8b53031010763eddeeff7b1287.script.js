var DecisionTableRuleHandler = Class.create();
DecisionTableRuleHandler.prototype = Object.extendsObject(sn_nb_action.RuleTypeHandlerBase, {
    initialize: function() {},

    /*
     * This identifies the rule type handled by this implementation.
     * Should be name of a table that extends "sn_nb_action_rule_base" table.
     */
    getId: function() {
        return sn_nb_action.Constants.TBL_DECISION_TABLE_RULE;
    },

    /*
     * Return an array of GlideRecord actions recommended by this rule
     */
    evaluateRule: function(currentRecord, ruleRecord) {
        var dt = new sn_dt.DecisionTableAPI();
        var input = new Object();
        input[sn_nb_action.Constants.INPUT_START_CONTEXT] = currentRecord;
        input[sn_nb_action.Constants.INPUT_START_CONTEXT_USER] = currentRecord;
        var actions = dt.getDecisions(ruleRecord.getValue(sn_nb_action.Constants.COL_DECISION_TABLE), input);
        var recommendedActions = [];
        var recommendedAction;
        for (var i = 0; i < actions.length; i++) {
            recommendedAction = sn_nb_action.RecommendedAction.createFromRule(actions[i], new Object(), ruleRecord.getValue(sn_nb_action.Constants.COL_ROLES));
            recommendedActions.push(recommendedAction);
        }
        return recommendedActions;
    },

    /*
     * Checks if recommended action is valid for current rule
     */
    isValidRule: function(ruleRecord) {
        var tableName = ruleRecord[sn_nb_action.Constants.COL_RULE_CONTEXT][sn_nb_action.Constants.COL_CONTEXT];
        var decisionTableId = ruleRecord.getValue(sn_nb_action.Constants.COL_DECISION_TABLE);

        var tables = new GlideTableHierarchy(tableName);
        var hierarchyTablesList = tables.getHierarchy();

        //check if decision table captures the given tablename reference record as one of its input.
        var inputsGr = new GlideRecord(sn_nb_action.Constants.TBL_DECISION_INPUT);
        inputsGr.addQuery(sn_nb_action.Constants.COL_MODEL, decisionTableId);
        inputsGr.addQuery(sn_nb_action.Constants.COL_INTERNAL_TYPE, sn_nb_action.Constants.VAL_REFERENCE);
        inputsGr.addQuery(sn_nb_action.Constants.COL_REFERENCE, hierarchyTablesList);
        inputsGr.query();
        if (!inputsGr.next()) {
            var tableGr = new GlideRecord(sn_nb_action.Constants.TBL_SYS_DB_OBJECT);
            tableGr.query(sn_nb_action.Constants.COL_NAME, tableName);
            tableGr.next();
            gs.addErrorMessage(gs.getMessage("Selected decision table '{0}' does not accept '{1}' record as input.Please reconfigure the rule", [ruleRecord.getDisplayValue(sn_nb_action.Constants.COL_DECISION_TABLE), tableGr.getDisplayValue()]));
            return false;
        }

        var dt = new sn_dt.DecisionTableAPI();
        var response = dt.getAnswers(decisionTableId);
        var nextBestActionService = new sn_nb_action.NextBestActionService();

        var actionsArray = response['result'];
        var actionCount = actionsArray.length;
        if (actionCount == 0) {
            gs.addErrorMessage(gs.getMessage("Selected decision table '{0}' does not have any answer records asscociated with it.", [ruleRecord.getDisplayValue(sn_nb_action.Constants.COL_DECISION_TABLE)]));
            return false;
        }
        var actionTableName = actionsArray[0].table;
        var actionRecord = new GlideRecord(actionTableName);
        for (var i = 0; i < actionCount; i++) {
            actionRecord.get(actionsArray[i].value);
            if (!nextBestActionService.isActionAllowed(tableName, actionRecord))
                return false;
        }
        return true;
    },

    type: 'DecisionTableRuleHandler'
});
