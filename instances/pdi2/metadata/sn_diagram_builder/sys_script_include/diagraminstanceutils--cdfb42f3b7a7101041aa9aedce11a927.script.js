var DiagramInstanceUtils = Class.create();
DiagramInstanceUtils.prototype = {
    initialize: function(id, diagramJSON) {
        this.instance = new DiagramBuilderInstance().getById(id);
        this.diagramJSON = diagramJSON || this.instance.diagram_json;
    },
    getDiagramJSON: function() {
        return this.diagramJSON || this.instance.diagram_json;
    },
    save: function() {
        this.instance.diagram_json = this.diagramJSON;
        this.instance.state = "draft";
        this.instance.update();
    },
    getId: function() {
        return this.instance.getUniqueValue();
    },
    createInstance: function(name, scopeId, configId) {
        if (!gs.nil(configId))
            return DiagramBuilderInstanceService.createInstanceByConfigId(configId, name);
        return DiagramBuilderInstanceService.createInstanceByConfigId(this._getConfigIdByScopeId(scopeId), name);
    },
    _getConfigIdByScopeId: function(scopeId) {
        return BuilderConfigurationService.getConfigurationIdByScopeId(scopeId);
    },
    deleteInstance: function(instanceId) {
        return DiagramBuilderInstanceService.deleteInstance(instanceId);
    },
    setReadOnly: function(value) {
        this.instance.read_only = value;
    },
    isReadOnly: function() {
        return this.instance.read_only;
    },
    type: 'DiagramInstanceUtils'
};
