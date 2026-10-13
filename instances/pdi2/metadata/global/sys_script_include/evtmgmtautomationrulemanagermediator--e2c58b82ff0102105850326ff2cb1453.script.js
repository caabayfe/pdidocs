var EvtMgmtAutomationRuleManagerMediator = Class.create();
EvtMgmtAutomationRuleManagerMediator.prototype = {
    initialize: function() {
        this.em = new SNC.EventRuleManager();
        this.evtMgmtEventProcessor = new SNC.EvtMgmtEventProcessor();
    },
    simulateMultipleEventsPreviewProcessing: function(eventSysIds, ruleJson, previewMode, onlyChangedRules) {
        if (onlyChangedRules == null){
          onlyChangedRules = false;
        }
        var simulatedAlertsJson = this.evtMgmtEventProcessor.simulateMultipleEventsPreviewProcessing(
            eventSysIds, ruleJson, previewMode, onlyChangedRules);
        return simulatedAlertsJson;
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
    type: 'EvtMgmtAutomationRuleManagerMediator'
};
