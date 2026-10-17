var PDProcessDefinitionService = Class.create();
PDProcessDefinitionService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDProcessDefinitionRepository();
    },
    getProcessDefinition: function(sysId) {
        return this.repository.getProcessDefinition(sysId);
    },
    updateProcessDefinition: function(fields) {
        return this.repository.updateProcessDefinition(fields);
    },
    insertProcessDefinition: function(fields) {
        return this.repository.insertProcessDefinition(fields);
    },
    deleteProcessDefinition: function(sysId) {
        return this.repository.deleteProcessDefinition(sysId);
    },
    getUnsupportedFeatures: function(processDefinitionId, targetProcessTypeId) {
        return this.repository.getUnsupportedFeatures(processDefinitionId, targetProcessTypeId);
    },
    getParentPlaybooks: function(processDefinitionId) {
        return this.repository.getParentPlaybooks(processDefinitionId);
    },
    type: 'PDProcessDefinitionService'
};
