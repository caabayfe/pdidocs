var ConsolidateActionsImpl = Class.create();
ConsolidateActionsImpl.prototype = {
    initialize: function() {
        this._nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
    },

    _transformActions: function(existingActions) {
        var existingRules = {};
        for (var recommend in existingActions) {
            if (existingActions.hasOwnProperty(recommend)) {
                var recommendedAction = existingActions[recommend];
                for (var k = 0; k < recommendedAction.length; k++) {
                    var detailObj = recommendedAction[k];
                    var rules = detailObj.getRules();
                    for (var ruleSysId in rules) {
                        if (rules.hasOwnProperty(ruleSysId)) {
                            if (!existingRules.hasOwnProperty(ruleSysId))
                                existingRules[ruleSysId] = {};
                            if (!existingRules[ruleSysId].hasOwnProperty(recommend))
                                existingRules[ruleSysId][recommend] = [];
                            existingRules[ruleSysId][recommend].push(detailObj);
                        }
                    }
                }
            }
        }
        return existingRules;
    },

    consolidateUnsavedChanges: function(existingActions, currentActions, currentRules) {
        var oldActions = this._transformActions(existingActions);
        for (var rule in oldActions) {
            if (oldActions.hasOwnProperty(rule)) {
                if (!currentRules[rule]) {
                    for (var recommendedAction in oldActions[rule]) {
                        if (oldActions[rule].hasOwnProperty(recommendedAction)) {
                            if (!currentActions[recommendedAction])
                                currentActions[recommendedAction] = oldActions[rule][recommendedAction];
                        }
                    }
                }
            }
        }
    },

    /*
     * Returns a JSON Object containing details of NBA Detail records, NBA Detail Order records that need to be 
     * created or updated after comparing new recommendations with existing recommendations.
     */

    consolidateActions: function(existingActions, currentActions, currentRules, hasUnsavedChanges) {

        var result = {
            newActionDetails: false,
            newActionDetailOrders: false,
            updateActionDetailOrders: false
        };
        var actSysId = null;
        var currActDetArray;

        var newActionDetails = [];
        var newActionDetailOrders = [];
        var updateActionDetailOrders = [];

        for (actSysId in currentActions) {
            currActDetArray = currentActions[actSysId];
            if (!existingActions.hasOwnProperty(actSysId))
                this._addNewAction(currActDetArray, newActionDetails);
            else {
                var existingActDetArray = existingActions[actSysId];
                this._updateExistingActionDetailRecords(existingActDetArray, currActDetArray, newActionDetailOrders, updateActionDetailOrders);
                this._addActionInputsForExistingAction(existingActDetArray, currActDetArray, newActionDetails);
            }
        }
        if (hasUnsavedChanges)
            this.consolidateUnsavedChanges(existingActions, currentActions, currentRules);
        this._deactivateActionDetailRecords(existingActions, currentActions, updateActionDetailOrders);

        if (newActionDetails.length <= 0 && newActionDetailOrders.length <= 0 && updateActionDetailOrders.length <= 0)
            return false;

        if (newActionDetails.length > 0)
            result.newActionDetails = newActionDetails;

        if (newActionDetailOrders.length > 0)
            result.newActionDetailOrders = newActionDetailOrders;

        if (updateActionDetailOrders.length > 0)
            result.updateActionDetailOrders = updateActionDetailOrders;

        return result;
    },

    // prepare to add new Action recommended in this run
    _addNewAction: function(currActDetArray, newActionDetails) {
        for (var i = 0; i < currActDetArray.length; i++) {
            var currActDetObj = currActDetArray[i];
            newActionDetails.push(currActDetObj);
        }
    },

    // prepare to update Existing Action Detail Records if the Action has been recommended in the new run again
    _updateExistingActionDetailRecords: function(existingActDetArray, currActDetArray, newActionDetailOrders, updateActionDetailOrders) {
        for (var i = 0; i < existingActDetArray.length; i++) {
            var existingActDetObject = existingActDetArray[i];
            var duplicateActionDetObject = sn_nb_action.NextBestActionUtil.getDuplicateActionDetail(currActDetArray, existingActDetObject);
            if (duplicateActionDetObject) {
                this._updateActionDetailOrderObjects(duplicateActionDetObject, existingActDetObject, newActionDetailOrders, updateActionDetailOrders);
            } else
                this._deactivateActionDetail(existingActDetObject, updateActionDetailOrders);
        }
    },

	// checks if there are any new Actions recommended in new run by comparing actionsbeforeRegeneration and current actions recommended in new run
	checkNewRARecommended: function(existingActionsBeforeRegeneration, currentActions) {
		var duplicateActionDetailCount = 0;
		for (var actSysId in currentActions) {
			var currActDetArray = currentActions[actSysId];
			if (existingActionsBeforeRegeneration.hasOwnProperty(actSysId)) {
				var existingActDetArray = existingActionsBeforeRegeneration[actSysId];
				if (this._checkDuplicate(existingActDetArray, currActDetArray))
					duplicateActionDetailCount++;
			} else {
				return true;
			}
		}
		var currentActionsCount = Object.keys(currentActions).length;
		return currentActionsCount > duplicateActionDetailCount;
		},

	//checks if there are any duplicate actionDetail objects in currActDetArray & existingActDetArray by comparing action inputs
	_checkDuplicate: function(existingActDetArray, currActDetArray) {
		for (var i = 0; i < existingActDetArray.length; i++) {
            var existingActDetObject = existingActDetArray[i];
            var duplicateActionDetObject = sn_nb_action.NextBestActionUtil.getDuplicateActionDetail(currActDetArray, existingActDetObject);
            if (duplicateActionDetObject) {
				return true;
            } 
        }
		return false;
	},

    // prepare creating new Action Detail records if new action inputs for existing action have been generated
    _addActionInputsForExistingAction: function(existingActDetArray, currActDetArray, newActionDetails) {
        for (var i = 0; i < currActDetArray.length; i++) {
            var currActDetObj = currActDetArray[i];
            var duplicateActionDetObject = sn_nb_action.NextBestActionUtil.getDuplicateActionDetail(existingActDetArray, currActDetObj);
            if (!duplicateActionDetObject)
                newActionDetails.push(currActDetObj);
        }
    },

    // prepare to deactivate existing Action Detail records, not recommended in this run.
    _deactivateActionDetailRecords: function(existingActions, currentActions, updateActionDetailOrders) {
        for (var actSysId in existingActions) {
            if (!currentActions.hasOwnProperty(actSysId)) {
                var existingActDetArray = existingActions[actSysId];
                for (var i = 0; i < existingActDetArray.length; i++) {
                    var existingActDetObject = existingActDetArray[i];
                    this._deactivateActionDetail(existingActDetObject, updateActionDetailOrders);
                }
            }
        }
    },

    // prepare to deactivate all Action Detail Order records for existing Action Detail record
    _deactivateActionDetail: function(existingActDetObject, updateActionDetailOrders) {
        var existingRulesObject = existingActDetObject.getRules();
        for (var ruleSysId in existingRulesObject) {
            var existingActDetOrdObject = existingRulesObject[ruleSysId];
            if (!existingActDetOrdObject.isActive())
                continue;
            existingActDetOrdObject.setActive(false);
            updateActionDetailOrders.push(existingActDetOrdObject);
        }
    },

    // prepare to update Action Detail Order Objects records for existing Action Detail Object
    _updateActionDetailOrderObjects: function(duplicateActDetObject, existingActDetObject, newActionDetailOrders, updateActionDetailOrders) {
        var existingActDetOrdObject, curActDetOrderObject;
        for (var ruleSysId in existingActDetObject.getRules()) {
            existingActDetOrdObject = existingActDetObject.getActionDetailOrderByRule(ruleSysId);
            if (duplicateActDetObject.containsRule(ruleSysId)) {
                // overwrite the existing Action Detail Order info with new Action Detail Order
                curActDetOrderObject = duplicateActDetObject.getActionDetailOrderByRule(ruleSysId);

                if (!curActDetOrderObject.equals(existingActDetOrdObject)) {
                    sn_nb_action.ActionDetailOrder.appendGroups(curActDetOrderObject, existingActDetOrdObject.getActionGroups());
                    curActDetOrderObject.setActionDetail(existingActDetOrdObject.getActionDetail());
                    curActDetOrderObject.setActionDetailOrderId(existingActDetOrdObject.getActionDetailOrderId());
                    updateActionDetailOrders.push(curActDetOrderObject);
                } else {
                    if (sn_nb_action.ActionDetailOrder.appendGroups(existingActDetOrdObject, curActDetOrderObject.getActionGroups()))
                        updateActionDetailOrders.push(existingActDetOrdObject);
                }
            } else {
                // Set active to false for existing active Action Detail Order.
                if (existingActDetOrdObject.isActive()) {
                    existingActDetOrdObject.setActive(false);
                    updateActionDetailOrders.push(existingActDetOrdObject);
                }
            }
        }
        this._addActionDetailOrderForExistingActionDetail(duplicateActDetObject, existingActDetObject, newActionDetailOrders);
    },

    // prepare to add new Action Detail Order records if new rules suggested the existing action detail record in this run
    _addActionDetailOrderForExistingActionDetail: function(duplicateActDetObject, existingActDetObject, newActionDetailOrders) {
        var curActDetOrderObject;
        for (var ruleSysId in duplicateActDetObject.getRules()) {
            if (!(existingActDetObject.containsRule(ruleSysId))) {
                curActDetOrderObject = duplicateActDetObject.getActionDetailOrderByRule(ruleSysId);
                curActDetOrderObject.setActionDetail(existingActDetObject.getId());
                newActionDetailOrders.push(curActDetOrderObject);
            }
        }
    },


    type: 'ConsolidateActionsImpl'
};
