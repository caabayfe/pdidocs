var PDOverrideService = Class.create();
PDOverrideService.prototype = {
    initialize: function(opts) {
        this.repository = (opts && opts.repository) || new PDOverrideRepository();
    },
    type: 'PDOverrideService',
    getOverrides: function(processDefinitionId) {
        return this.repository.getOverridesByProcessDefinition(processDefinitionId);
    },
    insertOverrides: function(overrides) {
        return (overrides || []).map(function(fields) {
            return this.repository.insertOverride(fields);
        }.bind(this));
    },
    updateOverrides: function(overrides) {
        return (overrides || []).map(function(fields) {
            return this.repository.updateOverride(fields);
        }.bind(this));
    },
    deleteOverrides: function(overrideIds) {
        this.repository.deleteOverrides((overrideIds || []).join(','));
    }
};
