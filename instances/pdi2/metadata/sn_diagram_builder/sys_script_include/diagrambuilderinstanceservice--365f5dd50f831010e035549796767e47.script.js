var DiagramBuilderInstanceService = Class.create();
DiagramBuilderInstanceService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderInstanceService'
};

DiagramBuilderInstanceService.getInstanceByInstanceId = function(instanceId) {
    var builderInstanceGr = DiagramBuilderInstance.getInstanceByInstanceId(instanceId);
    var builderInstance = {};

    builderInstance.sysId = builderInstanceGr.getUniqueValue();
    builderInstance.name = builderInstanceGr.getValue(DiagramBuilderInstance.NAME);
    builderInstance.builderConfiguration = builderInstanceGr.getValue(DiagramBuilderInstance.BUILDER_CONFIGURATION);
    builderInstance.diagramJSON = builderInstanceGr.getValue(DiagramBuilderInstance.DIAGRAM_JSON);
    builderInstance.state = builderInstanceGr.getValue(DiagramBuilderInstance.STATE);
    builderInstance.scopeName = builderInstanceGr.getDisplayValue(DiagramBuilderInstance.SCOPE_ID);
    builderInstance.scopeId = builderInstanceGr.getValue(DiagramBuilderInstance.SCOPE_ID);
    builderInstance.tableName = DiagramBuilderInstance.TABLE;
    builderInstance.readOnly = builderInstanceGr.getValue(DiagramBuilderInstance.READ_ONLY) === "1";

    return builderInstance;
};

DiagramBuilderInstanceService.createInstanceByConfigId = function(configId, name) {
    var payload = {};
    payload["builder_configuration"] = configId;
    payload["name"] = name;
    return DiagramBuilderInstance.createInstanceByPayload(payload);
};

/**
     * deleteInstance: 
     *   - Deletes a diagram instance by instanceId
     * @param {string} instanceId - sysId of the diagram instance
     * @returns {boolean} true if deleted; false if not found.
     */
DiagramBuilderInstanceService.deleteInstance = function(instanceId) {
    var gr = new GlideRecordSecure(DiagramBuilderInstance.TABLE);
    if (!gr.get(instanceId)) return false;                  
    return new DiagramBuilderInstance().deleteRecord(gr);
};
