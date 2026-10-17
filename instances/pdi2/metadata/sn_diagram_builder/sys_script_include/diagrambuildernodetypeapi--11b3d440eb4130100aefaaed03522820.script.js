var DiagramBuilderNodeTypeApi = Class.create();
DiagramBuilderNodeTypeApi.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeTypeApi'
};

DiagramBuilderNodeTypeApi.buildShapeTemplateJsonForNodeType = function(nodeType) {
    var shapeTemplateId = nodeType.shapeTemplate;
    var shapeTemplateJson = DiagramBuilderShapeTemplateApi.getShapeTemplateJson(shapeTemplateId);

	// Add connectors for this action, which will update shapeTemplateJson with appropriate ports.
    DiagramBuilderDiagramActionApi.addActionConnectors(nodeType.connectors, shapeTemplateJson);
    return shapeTemplateJson;
};

DiagramBuilderNodeTypeApi.getShapeTemplatesByNodeTypeIds = function(nodeTypeIds) {
    var nodeTypeShapeTemplateMap = {};
    nodeTypeIds.forEach(function(nodeTypeId) {
        var nodeType = DiagramBuilderNodeTypeService.getNodeTypeById(nodeTypeId);

        // Ensure that we pull only unique shape templates for each unique nodeType
        if (!nodeTypeShapeTemplateMap[nodeTypeId])
            nodeTypeShapeTemplateMap[nodeTypeId] = DiagramBuilderNodeTypeApi.buildShapeTemplateJsonForNodeType(nodeType);
    });

    return {
        nodeTypeShapeTemplateMap: nodeTypeShapeTemplateMap,
    };
};
