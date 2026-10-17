var DiagramBuilderCanvasAction = Class.create();

// table name
DiagramBuilderCanvasAction.TABLE = 'sn_diagram_builder_canvas_action';

// table fields
DiagramBuilderCanvasAction.NAME = 'name';
DiagramBuilderCanvasAction.SCRIPT = 'script';
DiagramBuilderCanvasAction.ACTION_TYPE = 'action_type';
DiagramBuilderCanvasAction.UI_COMPONENT = "ui_component";
DiagramBuilderCanvasAction.BUILDER_CONFIG = "builder_configuration";
DiagramBuilderCanvasAction.ORDER = "order";

DiagramBuilderCanvasAction.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderCanvasAction.TABLE;
    },
    type: 'DiagramBuilderCanvasAction'
});

DiagramBuilderCanvasAction.getActionsByConfigId = function(configId) {
    var encodedQuery = "builder_configuration=" + configId;
    return new DiagramBuilderCanvasAction().getByQuery(encodedQuery);
};
