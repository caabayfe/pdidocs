var PDFlowDataDefinitionService = Class.create();
PDFlowDataDefinitionService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDFlowDataDefinitionRepository();
    },
    type: 'PDFlowDataDefinitionService',
    insertFlowDataDefinition: function(dataDefinition) {
        return this.repository.insertFlowDataDefinition(dataDefinition);
    },
    updateFlowDataVariables: function(dataDefinition, previousDataDefinition) {
        return this.repository.updateFlowDataVariables(dataDefinition, previousDataDefinition);
    },
    deleteFlowDataDefinition: function(dataDefinitionId) {
        return this.repository.deleteFlowDataDefinition(dataDefinitionId);
    }
};
