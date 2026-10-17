var DiagramBuilderNodeTypeHandlerService = Class.create();
DiagramBuilderNodeTypeHandlerService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeTypeHandlerService'
};

DiagramBuilderNodeTypeHandlerService._constructNodeTypeHandlerObject = function(nodeTypeHandlerGr) {
    return {
        sysId: nodeTypeHandlerGr.getUniqueValue(),
        active: nodeTypeHandlerGr.getValue(DiagramBuilderNodeTypeHandler.ACTIVE) === "1",
        type: nodeTypeHandlerGr.getValue(DiagramBuilderNodeTypeHandler.TYPE),
        script: nodeTypeHandlerGr.getValue(DiagramBuilderNodeTypeHandler.SCRIPT)
    };
};

DiagramBuilderNodeTypeHandlerService.getNodeTypeHandlerById = function(nodeTypeHandlerId) {
    var nodeTypeHandlerGr = DiagramBuilderNodeTypeHandler.getNodeTypeById(nodeTypeHandlerId);
    return DiagramBuilderNodeTypeHandlerService._constructNodeTypeObject(nodeTypeHandlerGr);
};

DiagramBuilderNodeTypeHandlerService.getNodeTypeHandlersByNodeId = function(nodeId) {
    var handlers = [];
    var nodeTypeHandlerGr = DiagramBuilderNodeTypeHandler.getNodeTypeHandlersByNodeId(nodeId);
    while (nodeTypeHandlerGr.next()) {
        handlers.push(DiagramBuilderNodeTypeHandlerService._constructNodeTypeHandlerObject(nodeTypeHandlerGr));
    }
    return handlers;
};
