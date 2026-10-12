var ConditionBasedRuleHandler = Class.create();
ConditionBasedRuleHandler.prototype = Object.extendsObject(sn_nb_action.RuleTypeHandlerBase, {
    initialize: function() {},
    /*
     * This identifies the rule type handled by this implementation.
     * Should be name of a table that extends "sn_nb_action_rule_base" table.
     */
    getId: function() {
        return sn_nb_action.Constants.TBL_CONDITION_BASED_RULE;
    },
    /*
     * Return an array of GlideRecord actions recommended by this rule
     */
    evaluateRule: function(currentRecord, ruleRecord, recommendationType, contextRecord, ruleContext) {
        var recommendedActionsArr = [];
        var _log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
        var condition = ruleRecord.getValue(sn_nb_action.Constants.COL_CONDITION);
        var ruleCondition = ruleRecord.getValue(sn_nb_action.Constants.COL_ADVANCED_CONDITION);
        var hasContextInputs = sn_nb_action.NextBestActionUtil.getNextBestActionDAO().hasContextInputs(ruleContext, false);

        if (!gs.nil(ruleCondition) && hasContextInputs) { //advanced condition evaluation
            var glideVarField = contextRecord.context_inputs;
            var inputTableName = ruleContext.getValue(sn_nb_action.Constants.COL_INPUT_TABLE);
            var inputTableGr = new GlideRecord(inputTableName);
            Object.keys(glideVarField).forEach(function(key) {
                if (key != "sys_meta" && key != "sys_id") {
                    inputTableGr.setValue(key, glideVarField[key].getValue());
                }
            });
            var filterCondition = GlideFilter.checkRecord(inputTableGr, ruleCondition);
            if (filterCondition) {
                recommendedActionsArr = this._recommendationEvaluator(currentRecord, ruleRecord, recommendationType, recommendedActionsArr, ruleContext);
            }
        } else if (!gs.nil(condition)) {
            var name = ruleRecord.getValue(sn_nb_action.Constants.COL_NAME);
            var filter = new GlideFilter(condition, name);
            filter.setCaseSensitive(false);
            if (filter.match(currentRecord, true)) {
                recommendedActionsArr = this._recommendationEvaluator(currentRecord, ruleRecord, recommendationType, recommendedActionsArr, ruleContext);
            }
        }
        if (recommendedActionsArr && recommendedActionsArr.length > 0)
            return recommendedActionsArr;

        return false;
    },

    _recommendationEvaluator: function(currentRecord, ruleRecord, recommendationType, recommendedActionsArr, ruleContext) {
        var recommendedActionEvaluator = new sn_nb_action.RecommendedActionEvaluator();
        var recommendedActionsGr = recommendedActionEvaluator.prepQuery(ruleRecord, recommendationType);
        recommendedActionsGr.query();
        while (recommendedActionsGr.next()) {
            try {
                var currentRecommendedActionsArr = recommendedActionEvaluator.evaluateRecommendedAction(recommendedActionsGr, currentRecord, ruleContext);
                if (currentRecommendedActionsArr && currentRecommendedActionsArr.length > 0) {
                    recommendedActionsArr.push.apply(recommendedActionsArr, currentRecommendedActionsArr);
                }
            } catch (ex) {
                _log.error("Failed to evaluate Recommended Action " + recommendedActionsGr.getUniqueValue() + " for context " + currentRecord.getUniqueValue());
            }
        }
        return recommendedActionsArr;
    },

    /*
     * Returns true if the rule is valid
     */
    isValidRule: function(ruleRecord) {
        return true;
    },
    type: 'ConditionBasedRuleHandler'
});
