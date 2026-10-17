var ActionDetailOrder = Class.create();
ActionDetailOrder.prototype = {
    initialize: function() {
		this.actionGroups = {};
	},

    getRule: function() {
        return this.ruleSysId;
    },

    setRule: function(ruleSysId) {
        this.ruleSysId = ruleSysId;
    },

    getActionDetail: function() {
        return this.actionDetailId;
    },

    setActionDetail: function(actionDetailId) {
        this.actionDetailId = actionDetailId;
    },

    getInterOrder: function() {
        return this.interOrder;
    },

    setInterOrder: function(interOrder) {
        this.interOrder = interOrder;
    },

    getIntraOrder: function() {
        return this.intraOrder;
    },

    setIntraOrder: function(intraOrder) {
        this.intraOrder = intraOrder;
    },

    getRoles: function() {
        return this.roles;
    },

    setRoles: function(roles) {
        this.roles = roles;
    },

    isActive: function() {
        return this.active;
    },

    setActive: function(active) {
        this.active = active;
    },

    getActionDetailOrderId: function() {
        return this.actionDetailOrderId;
    },

    setActionDetailOrderId: function(actionDetailOrderId) {
        this.actionDetailOrderId = actionDetailOrderId;
    },

    getHint: function() {
        return this.hint;
    },

    setHint: function(hint) {
        this.hint = hint;
    },
	
	getActionGroups: function() {
        if (gs.nil(this.actionGroups)) return;
        var actionGroups = Object.keys(this.actionGroups);
        if (gs.nil(actionGroups) || actionGroups.length <= 0) return;
        return actionGroups;
    },
	getActionGroupsAsCommaSeparatedString: function(){
		if (gs.nil(this.actionGroups)) return "";
        var actionGroups = Object.keys(this.actionGroups);
        if (gs.nil(actionGroups) || actionGroups.length <= 0) return "";
        return actionGroups.join(",");
	},
    containsActionGroup: function(actionGroup) {
        if (this.actionGroups.hasOwnProperty(actionGroup))
            return true;
        return false;
    },
    setActionGroupsFromString: function(actionGroups) {
        if (gs.nil(actionGroups)) return;
        var contextGroups = actionGroups.split(",");
        for (var i = 0; i < contextGroups.length; i++) {
            var actionGroup = contextGroups[i];
            this.actionGroups[actionGroup] = actionGroup;
        }
    },
	
    appendActionGroup: function(actionGroup) {
        if (gs.nil(actionGroup)) return;
        this.actionGroups[actionGroup] = actionGroup;
    },


    isValid: function() {
        if (gs.nil(this.ruleSysId) ||
            gs.nil(this.intraOrder)
        )
            return false;
        return true;
    },

    equals: function(actionDetailOrderObj) {
        if (this.intraOrder != actionDetailOrderObj.getIntraOrder())
            return false;
        if (this.interOrder != actionDetailOrderObj.getInterOrder())
            return false;
        if (this.active != actionDetailOrderObj.isActive())
            return false;
        if (this.ruleSysId != actionDetailOrderObj.getRule())
            return false;
        return true;
    },

    type: 'ActionDetailOrder'
};

ActionDetailOrder.createFromRule = function(ruleSysId, interOrder, intraOrder, hint, groups) {
    var actionOrderDetObj = new ActionDetailOrder();
    actionOrderDetObj.setRule(ruleSysId);
    actionOrderDetObj.setInterOrder(interOrder);
    actionOrderDetObj.setIntraOrder(intraOrder);
    actionOrderDetObj.setActive(true);
    actionOrderDetObj.setHint(hint);
	actionOrderDetObj.setActionGroupsFromString(groups);
    return actionOrderDetObj;
};

ActionDetailOrder.createFromRecord = function(actionDetailOrderRecord) {
    var actionDetOrderObj = new ActionDetailOrder();
    actionDetOrderObj.setRule(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_RULE));
    actionDetOrderObj.setInterOrder(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_INTER_ORDER));
    actionDetOrderObj.setIntraOrder(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_INTRA_ORDER));
    actionDetOrderObj.setActive(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_ACTIVE) == '1');
    actionDetOrderObj.setActionDetail(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_NEXT_BEST_ACTION));
    actionDetOrderObj.setActionDetailOrderId(actionDetailOrderRecord.getUniqueValue());
    actionDetOrderObj.setHint(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_RECOMMENDATION_HINT));
	actionDetOrderObj.setActionGroupsFromString(actionDetailOrderRecord.getValue(sn_nb_action.Constants.COL_CONTEXT_GROUPS));
    return actionDetOrderObj;
};

ActionDetailOrder.appendGroups = function(originalActionDetailOrderObj, newGroups) {
    var originalGroups = originalActionDetailOrderObj.getActionGroups();

    if ((gs.nil(originalGroups) && gs.nil(newGroups)) ||
        (!gs.nil(originalGroups) && gs.nil(newGroups))
    ) return false;

    var updated = false;
    for (var i = 0; i < newGroups.length; i++) {
		if(originalActionDetailOrderObj.containsActionGroup(newGroups[i])) continue;
        originalActionDetailOrderObj.appendActionGroup(newGroups[i]);
		updated = true;
    }
	return updated;
};
