var DiagramBuilderNodeTypeService = Class.create();
DiagramBuilderNodeTypeService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeTypeService'
};

DiagramBuilderNodeTypeService._constructNodeTypeObject = function(nodeTypeGr) {
    var sysId = nodeTypeGr.getUniqueValue();
    var connectors = DiagramBuilderNodeConnectorService.getNodeConnectorsByType(sysId);
    var attributes = DiagramBuilderNodeTypeAttributeService.getAttributesByNodeTypeId(sysId);
    return {
        active: nodeTypeGr.getValue(DiagramBuilderNodeType.ACTIVE),
        icon: nodeTypeGr.getValue(DiagramBuilderNodeType.ICON),
        description: nodeTypeGr.getValue(DiagramBuilderNodeType.DESCRIPTION),
        shapeTemplate: nodeTypeGr.getValue(DiagramBuilderNodeType.SHAPE_TEMPLATE),
        nodeType: nodeTypeGr.getValue(DiagramBuilderNodeType.NODE_TYPE),
        sysId: sysId,
        allowDelete: nodeTypeGr.getValue(DiagramBuilderNodeType.ALLOW_DELETE) === "1",
        nodeTypeHandlers: DiagramBuilderNodeTypeHandlerService.getNodeTypeHandlersByNodeId(nodeTypeGr.getUniqueValue()),
        menuOptions: DiagramBuilderNodeMenuOptionService.getOptionsByNodeType(nodeTypeGr.getUniqueValue()),
        connectors: connectors,
        attributes: attributes
    };
};

DiagramBuilderNodeTypeService.getNodeTypeById = function(nodeTypeId) {
    var nodeTypeGr = DiagramBuilderNodeType.getNodeTypeById(nodeTypeId);
    return DiagramBuilderNodeTypeService._constructNodeTypeObject(nodeTypeGr);
};
