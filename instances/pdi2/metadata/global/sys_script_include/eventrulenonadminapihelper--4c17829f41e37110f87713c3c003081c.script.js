var EvtMgmtAlertUtilsMediator = Class.create();
EvtMgmtAlertUtilsMediator.prototype = {
    initialize: function() {
		this.em = new SNC.EventRuleManager();
	},

    getEventRuleData: function(inputType, sysId) {
        var json = this.em.getEventRuleData(inputType, sysId);
        return json;
    },

    getAllEventSources: function() {
        var sourcesList = this.em.getAllEventSources();
        return sourcesList;
    },

    saveEventRuleData: function(eventRuleJson) {
        var ruleId = this.em.saveEventRuleData(eventRuleJson);
        return ruleId;
    },

    type: 'EvtMgmtAlertUtilsMediator'
};
