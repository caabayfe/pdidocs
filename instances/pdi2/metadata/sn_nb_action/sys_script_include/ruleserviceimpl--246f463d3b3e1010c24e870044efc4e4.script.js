var RuleServiceImpl = Class.create();
RuleServiceImpl.prototype = {
    initialize: function() {
        this.nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
    },

    getBestActions: function(currentRecord, actionTypes, recommendationType, fields, ruleContext, contextRecord) {
        var rules = {};
        if (!actionTypes) {
            actionTypes = this.nextBestActionDAO.loadActionTypesByTable();
            if (!actionTypes) {
                this._log.error("There are no action types defined.");
                return false;
            }
        }
        var rulesRecord = this.nextBestActionDAO.getRules(currentRecord, fields, ruleContext);
        if (!rulesRecord) {
            this._log.error("There are no rules defined or rules are inactive for table " + currentRecord.getTableName());
            return false;
        }
        var currentActions = {};
        var hasActions = false;
        var ruleOrder = 0; // to set inter order for a action detail order
        while (rulesRecord.next()) {
            rules[rulesRecord.getUniqueValue()] = true;
            var recommendedActionsArr = this._evaluateRule(currentRecord, rulesRecord, recommendationType, contextRecord, ruleContext);
            if (recommendedActionsArr) {
                ruleOrder++;
                var ruleActions = this._processActions(recommendedActionsArr, rulesRecord, currentActions, actionTypes, ruleOrder, currentRecord.getUniqueValue());
                if (ruleActions) {
                    hasActions = true;
                    currentActions = Object.extend(currentActions, ruleActions);
                }
            }
        }
        if (hasActions)
            return {
                'currentActions': currentActions,
                'currentRules': rules
            };

        return {
            'currentActions': false,
            'currentRules': rules
        };
    },
    _processActions: function(recommendedActionsArr, ruleRecord, currentActions, actionTypes, ruleOrder, currentRecordSysId) {
        var ruleActions = {};
        var hasActions = false;
        for (var i = 0; i < recommendedActionsArr.length; i++) {
            var actionRecord = recommendedActionsArr[i].getAction();
            if (!sn_nb_action.NextBestActionUtil.isValidRecord(actionRecord))
                continue;
            var actionSysId = actionRecord.getUniqueValue();
            var actionTableName = actionRecord.getTableName();
            var actionTypeDetail = actionTypes[actionTableName];
            try {
                if (actionTypeDetail) {
                    var newActionDetailObj = sn_nb_action.ActionDetail.createFromRule(ruleRecord, actionTypeDetail, i + 1, recommendedActionsArr[i], ruleOrder, currentRecordSysId);
                    if (currentActions.hasOwnProperty(actionSysId) || ruleActions.hasOwnProperty(actionSysId))
                        this._processEvaluatedAction(currentActions, ruleActions, newActionDetailObj, actionSysId, ruleRecord, i + 1, recommendedActionsArr[i],ruleOrder, currentRecordSysId);
                    else {
                        ruleActions[actionSysId] = [newActionDetailObj];
                        hasActions = true;
                    }
                } else
                    this._log.error("Undefined action type " + [ruleRecord.getUniqueValue(), actionTableName, actionSysId]);
            } catch (ex) {
                this._log.error("Error processing recommended action: " + recommendedActionsArr[i].getHint() + " " + ex.message);
            }
        }
        if (hasActions)
            return ruleActions;
        return false;
    },
    _processEvaluatedAction: function(currentActions, ruleActions, newActionDetailObj, actionSysId, ruleRecord, intraorder, recommendedAction,ruleOrder, currentRecordSysId) {
        var processedActionDetArray, duplicateActionDetObject;
        if (currentActions.hasOwnProperty(actionSysId)) {
            processedActionDetArray = currentActions[actionSysId];
            duplicateActionDetObject = sn_nb_action.NextBestActionUtil.getDuplicateActionDetail(processedActionDetArray, newActionDetailObj);
            if (duplicateActionDetObject) {
                //action detail with same action input was recommended by another rule
                sn_nb_action.ActionDetail.updateFromRule(duplicateActionDetObject, ruleRecord, intraorder, recommendedAction, ruleOrder);
            } else
                processedActionDetArray.push(newActionDetailObj);
        } else { //same rule duplicate recommendation
            processedActionDetArray = ruleActions[actionSysId];
            duplicateActionDetObject = sn_nb_action.NextBestActionUtil.getDuplicateActionDetail(processedActionDetArray, newActionDetailObj);
            if (!duplicateActionDetObject)
                processedActionDetArray.push(newActionDetailObj);
            else {
                // update groups for the existing action from new action 
                sn_nb_action.ActionDetail.updateFromRule(duplicateActionDetObject, ruleRecord, intraorder, recommendedAction, ruleOrder);
            }
        }
    },
    _evaluateRule: function(currentRecord, ruleRecord, recommendationType, contextRecord, ruleContext) {
        var ruleRoles = ruleRecord.getValue(sn_nb_action.Constants.COL_ROLES);
        if (gs.nil(ruleRoles) || gs.hasRole(ruleRoles)) {
            var ruleTableName = ruleRecord.getValue(sn_nb_action.Constants.COL_SYS_CLASS_NAME);
            var ruleHandler = sn_nb_action.NextBestActionUtil.getRuleTypeHandler(ruleTableName);
            if (ruleHandler && typeof ruleHandler.evaluateRule == "function") {
                try {
                    var actualRuleRecord = new GlideRecord(ruleTableName);
                    if (actualRuleRecord.get(ruleRecord.getUniqueValue())) {
                        var recommendedActionsArr = ruleHandler.evaluateRule(currentRecord, actualRuleRecord, recommendationType, contextRecord, ruleContext);
                        if (recommendedActionsArr && Array.isArray(recommendedActionsArr) && recommendedActionsArr.length > 0)
                            return recommendedActionsArr;
                    }
                } catch (ex) {
                    this._log.error("Failed to evaluate action(s) for rule " + ruleRecord.getUniqueValue());
                }
            } else
                this._log.error("Could not find implementaion for rule type " + ruleTableName);
        }
        return false;
    },
    isValidRule: function(ruleRecord) {
        var ruleTableName = ruleRecord.getValue(sn_nb_action.Constants.COL_SYS_CLASS_NAME);
        var ruleHandler = sn_nb_action.NextBestActionUtil.getRuleTypeHandler(ruleTableName);
        if (ruleHandler && typeof ruleHandler.isValidRule == "function") {
            return ruleHandler.isValidRule(ruleRecord);
        } else
            this._log.error("Could not find implementaion for rule type " + ruleTableName);
        return false;
    },
    type: 'RuleServiceImpl'
};
