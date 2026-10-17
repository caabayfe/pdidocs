var PDTriggerInstanceService = Class.create();
PDTriggerInstanceService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDTriggerInstanceRepository();
    },
    type: 'PDTriggerInstanceService',

    getTriggerInstances: function(processDefinitionId) {
        return this.repository.getTriggerInstancesByProcessDefinition(processDefinitionId);
    },
    insertTriggerInstances: function(processDefinitionId, triggerInstances) {
        return this.repository.insertTriggerInstances(processDefinitionId, (triggerInstances || []));
    },
    updateTriggerInstances: function(processDefinitionId, triggerInstances, processSchemaVersion) {
        return this.repository.updateTriggerInstances(processDefinitionId, (triggerInstances || []), processSchemaVersion);
    },
    deleteTriggerInstances: function(triggerInstanceIds) {
        this.repository.deleteTriggerInstances((triggerInstanceIds || []).join(','));
    }
};
