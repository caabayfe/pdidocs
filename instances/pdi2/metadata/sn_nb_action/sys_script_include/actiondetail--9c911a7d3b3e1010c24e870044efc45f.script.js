var ActionDetail = Class.create();
ActionDetail.prototype = {
    initialize: function() {
        this.ruleSysIds = {};
    },

    getId: function() {
        return this.id;
    },

    setId: function(sysId) {
        this.id = sysId;
    },

    getActionInputs: function() {
        return this.actionInputs;
    },

    setActionInputs: function(actionInputs) {
        this.actionInputs = actionInputs;
    },

    getActionType: function() {
        return this.actionTypeSysId;
    },

    setActionType: function(actionTypeSysId) {
        this.actionTypeSysId = actionTypeSysId;
    },

    getActionTypeTable: function() {
        return this.actionTypeTable;
    },

    setActionTypeTable: function(actionTypeTable) {
        this.actionTypeTable = actionTypeTable;
    },

    getAction: function() {
        return this.actionSysId;
    },

    setAction: function(actionSysId) {
        this.actionSysId = actionSysId;
    },

    isActive: function() {
        return this.active;
    },

    setActive: function(active) {
        this.active = active;
    },

    getState: function() {
        return this.state;
    },

    setState: function(state) {
        this.state = state;
    },

    getStateDisplayValue: function() {
        return this.stateDisplayValue;
    },

    setStateDisplayValue: function(state) {
        this.stateDisplayValue = state;
    },

    getTitle: function() {
        return this.title;
    },

    setTitle: function(title) {
        this.title = title;
    },

    getDescription: function() {
        return this.description;
    },

    setDescription: function(description) {
        this.description = description;
    },

    getErrorMessage: function() {
        return this.errorMessage;
    },

    setErrorMessage: function(errorMessage) {
        this.errorMessage = errorMessage;
    },

    getCustomAttribute: function() {
        return this.customAttributes;
    },

    setCustomAttribute: function(customAttributes) {
        this.customAttributes = customAttributes;
    },

    getAttribute: function() {
        return this.attribute;
    },

    setAttribute: function(attribute) {
        this.attribute = attribute;
    },

    getCallToActions: function(callToAction) {
        return this.callToAction;
    },

    setCallToActions: function(callToAction) {
        this.callToAction = callToAction;
    },

    getCreatedOn: function() {
        return this.createdOn;
    },

    setCreatedOn: function(createdOn) {
        this.createdOn = createdOn;
    },

    getUpdatedOn: function() {
        return this.updatedOn;
    },

    setUpdatedOn: function(updatedOn) {
        this.updatedOn = updatedOn;
    },

    getUseCase: function() {
        return this.useCase;
    },

    setUseCase: function(useCase) {
        this.useCase = useCase;
    },

    getParentActionId: function() {
        return this.parentActionId;
    },

    setParentActionId: function(parentActionId) {
        this.parentActionId = parentActionId;
    },

    containsRule: function(ruleSysId) {
        if (this.ruleSysIds.hasOwnProperty(ruleSysId))
            return true;
        return false;
    },

    getRules: function() {
        return this.ruleSysIds;
    },

    setRule: function(ruleSysId, actionOrderDetObj) {
        this.ruleSysIds[ruleSysId] = actionOrderDetObj;
    },

    getActionDetailOrderByRule: function(ruleSysId) {
        return this.ruleSysIds[ruleSysId];
    },

    setPreviewExperience: function(previewExperience) {
        this.previewExperience = previewExperience;
    },

    getPreviewExperience: function() {
        return this.previewExperience;
    },
    setActionInputLabels: function(actionInputLabels) {
        this.actionInputLabels = actionInputLabels;
    },
    getActionInputLabels: function() {
        return this.actionInputLabels;
    },
    getActionGroupsAsCommaSeparatedString: function() {
        if (gs.nil(this.ruleSysIds)) return "";
        var allGroups = {};
        for (var ruleSysId in this.ruleSysIds) {
            if (!this.ruleSysIds.hasOwnProperty(ruleSysId)) continue;
            var actionDetailOrderObj = this.ruleSysIds[ruleSysId];
            // get groups from only active detail orders
            if (!actionDetailOrderObj.isActive()) continue;
            var groups = actionDetailOrderObj.getActionGroups();
            if (gs.nil(groups) || groups.length <= 0) continue;
            for (var i = 0; i < groups.length; i++) {
                allGroups[groups[i]] = groups[i];
            }
        }
        if (gs.nil(allGroups)) return "";
        return Object.keys(allGroups).join(",");
    },

    hasEqualInputs: function(actionDetailObj) {
        var currActionInputs = this.getActionInputs();
        var actionInputs = actionDetailObj.getActionInputs();
        if (currActionInputs == null && actionInputs == null)
            return true;
        for (var input in actionInputs) {
            var value = actionInputs[input];
            if (sn_nb_action.NextBestActionUtil.isValidRecord(value)) {
                if (currActionInputs[input] instanceof GlideRecord && value.getUniqueValue() == currActionInputs[input].getUniqueValue())
                    continue;
                return false;
            } else if (value instanceof GlideRecord) {
                //value must be empty GlideRecord object
                if (currActionInputs[input] instanceof GlideRecord && sn_nb_action.NextBestActionUtil.isValidRecord(currActionInputs[input]))
                    return false;
            } else if (currActionInputs[input] instanceof GlideRecord) {
                // value must be ' '
                if (sn_nb_action.NextBestActionUtil.isValidRecord(currActionInputs[input]))
                    return false;
            } else if (value != currActionInputs[input])
                return false;
        }
        return true;
    },

    isValid: function() {
        if (gs.nil(this.ruleSysIds) ||
            gs.nil(this.actionTypeSysId) ||
            gs.nil(this.actionSysId))
            return false;
        return true;
    },

    type: 'ActionDetail'
};

// onlyActive param if passed true will add only active NBA Detail Order Rule information
ActionDetail.createFromRecord = function(actionDetailRecord, actionDetailOrders, onlyActive, hashIdToActionInputMap) {
    var actDetObj = new ActionDetail();
    actDetObj.setId(actionDetailRecord.getUniqueValue());
    if (actionDetailOrders) {
        while (actionDetailOrders && actionDetailOrders.next()) {
            if (onlyActive && actionDetailOrders.getValue(sn_nb_action.Constants.COL_ACTIVE) == 0)
                continue;
            var actionDetOrderObj = sn_nb_action.ActionDetailOrder.createFromRecord(actionDetailOrders);
            actDetObj.setRule(actionDetOrderObj.getRule(), actionDetOrderObj);
        }
    }
    actDetObj.setActionType(actionDetailRecord.getValue(sn_nb_action.Constants.COL_ACTION_TYPE));
    actDetObj.setActionTypeTable(actionDetailRecord[sn_nb_action.Constants.COL_ACTION_TYPE][sn_nb_action.Constants.COL_TABLE_NAME] + '');
    actDetObj.setAction(actionDetailRecord.getValue(sn_nb_action.Constants.COL_RECOMMENDED));
    actDetObj.setState(actionDetailRecord.getValue(sn_nb_action.Constants.COL_STATE));
    actDetObj.setStateDisplayValue(actionDetailRecord.getDisplayValue(sn_nb_action.Constants.COL_STATE));
    actDetObj.setAttribute(actionDetailRecord.getValue(sn_nb_action.Constants.COL_ATTRIBUTE));
    actDetObj.setCreatedOn(actionDetailRecord.getValue(sn_nb_action.Constants.COL_SYS_CREATED_ON));
    actDetObj.setUpdatedOn(actionDetailRecord.getValue(sn_nb_action.Constants.COL_SYS_UPDATED_ON));
    actDetObj.setParentActionId(actionDetailRecord.getValue(sn_nb_action.Constants.COL_PARENT_RA_ID));
    actDetObj.setUseCase(actionDetailRecord.getValue(sn_nb_action.Constants.COL_USE_CASE));
    var parentHashId = actionDetailRecord.getValue(sn_nb_action.Constants.COL_PARENT_RA_ID);
    if (hashIdToActionInputMap && hashIdToActionInputMap.hasOwnProperty(parentHashId)) {
        actDetObj.setActionInputs(hashIdToActionInputMap[parentHashId].actionInput);
        actDetObj.setActionInputLabels(hashIdToActionInputMap[parentHashId].actionInputLabels);
    } else {
        var result = sn_nb_action.NextBestActionUtil.getGlideVarInputsAndLabels(actionDetailRecord, sn_nb_action.Constants.COL_ACTION_INPUTS);
        actDetObj.setActionInputs(result.inputsObject);
        actDetObj.setActionInputLabels(result.labelObj);
    }
    return actDetObj;
};
ActionDetail.createFromUnsavedRecord = function(currentDetail, actionTypeTable, actionType, action, inputsObj) {
    var actDetObj = new ActionDetail();
    for (var key in currentDetail.ruleSysIds) {
        if (currentDetail.ruleSysIds.hasOwnProperty(key)) {
            var actionDetOrderObj = currentDetail.ruleSysIds[key];
            actDetObj.setRule(actionDetOrderObj.getRule(), actionDetOrderObj);
        }
    }
    if (currentDetail.id)
        actDetObj.setId(currentDetail.id);
    actDetObj.setActionTypeTable(actionTypeTable);
    actDetObj.setActionType(actionType);
    actDetObj.setAction(action);
    actDetObj.setState(currentDetail.state ? currentDetail.state : "new");
    actDetObj.setStateDisplayValue(currentDetail.stateDisplayValue ? currentDetail.stateDisplayValue : "New");
    if (currentDetail.attribute)
        actDetObj.setAttribute(currentDetail.attribute);
    if (currentDetail.createdOn)
        actDetObj.setCreatedOn(currentDetail.createdOn);
    if (currentDetail.updatedOn)
        actDetObj.setUpdatedOn(currentDetail.updatedOn);
    actDetObj.setActionInputs(inputsObj);
    return actDetObj;
};
ActionDetail.createFromRule = function(ruleRecord, actionTypeDetail, actionIntraOrder, recommendedAction, actionInterOrder, contextSysId) {
    var actionRecord = recommendedAction.getAction();
    var actionInputs = recommendedAction.getActionInputs();
    var hint = recommendedAction.getHint();
    var groups = recommendedAction.getGroups();
    var actDetObj = new ActionDetail();
    var ruleSysId = ruleRecord.getUniqueValue();
    var actionInputLabels = recommendedAction.getActionInputLabels();
    var order = actionInterOrder || 10000;
    var actionDetOrderObj = sn_nb_action.ActionDetailOrder.createFromRule(ruleSysId, order, actionIntraOrder, hint, groups);
    actDetObj.setRule(ruleRecord.getUniqueValue(), actionDetOrderObj);
    actDetObj.setActionType(actionTypeDetail[sn_nb_action.Constants.COL_SYS_ID]);
    actDetObj.setActionTypeTable(actionTypeDetail[sn_nb_action.Constants.COL_TABLE_NAME]);
    actDetObj.setAction(actionRecord.getUniqueValue());
    actDetObj.setActionInputs(actionInputs);
    actDetObj.setActionInputLabels(actionInputLabels);
    actDetObj.setParentActionId(sn_nb_action.NextBestActionUtil.getHashValue(contextSysId, actionRecord.getUniqueValue(), actionInputs));
    return actDetObj;
};
ActionDetail.updateFromRule = function(actDetObj, ruleRecord, actionIntraOrder, recommendedAction, actionInterOrder) {
    var hint = recommendedAction.getHint();
    var groups = recommendedAction.getGroupsAsArray();
    var ruleSysId = ruleRecord.getUniqueValue();
    var order = actionInterOrder || 10000;
    if (actDetObj.containsRule(ruleSysId)) {
        //append groups to existing actionDetailOrder belonging to one rule
        var originalActionDetOrderObj = actDetObj.getActionDetailOrderByRule(ruleSysId);
        sn_nb_action.ActionDetailOrder.appendGroups(originalActionDetOrderObj, groups);
        return false;
    }
    var actionDetOrderObj = sn_nb_action.ActionDetailOrder.createFromRule(ruleSysId, order, actionIntraOrder, hint, groups);
    actDetObj.setRule(ruleRecord.getUniqueValue(), actionDetOrderObj);

    return true;
};

ActionDetail.createFromSearchRecord = function(actionTypeDetail, action, inputsObj) {
    var actDetObj = new ActionDetail();
    actDetObj.setActionType(actionTypeDetail[sn_nb_action.Constants.COL_SYS_ID]);
    actDetObj.setActionTypeTable(actionTypeDetail[sn_nb_action.Constants.COL_TABLE_NAME]);
    actDetObj.setAction(action);
    actDetObj.setActionInputs(inputsObj);
    return actDetObj;

};
