var DiagramBuilderInstance = Class.create();

// table name
DiagramBuilderInstance.TABLE = 'sn_diagram_builder_instance';

// table fields
DiagramBuilderInstance.BUILDER_CONFIGURATION = 'builder_configuration';
DiagramBuilderInstance.NAME = 'name';
DiagramBuilderInstance.DIAGRAM_JSON = 'diagram_json';
DiagramBuilderInstance.STATE = 'state';
DiagramBuilderInstance.SCOPE_ID = 'sys_scope';
DiagramBuilderInstance.READ_ONLY = 'read_only';

// initialize script include by extending Crud base
DiagramBuilderInstance.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderInstance.TABLE;
    },

    type: 'DiagramBuilderInstance'
});


DiagramBuilderInstance.getInstanceByInstanceId = function(instanceId) {
    return new DiagramBuilderInstance().getById(instanceId);
};

DiagramBuilderInstance.createInstanceByPayload = function(payload) {
    var instance = new DiagramBuilderInstance().create(payload);
    return instance ? instance.getUniqueValue() : null;
};
