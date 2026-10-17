var DiagramBuilderNodeTypeAttributeService = Class.create();
DiagramBuilderNodeTypeAttributeService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeTypeAttributeService'
};

DiagramBuilderNodeTypeAttributeService._constructNodeTypeAttributeObject = function(nodeTypeAttributeGr) {
    return {
        attributeName: nodeTypeAttributeGr.getValue(DiagramBuilderNodeTypeAttribute.ATTRIBUTE_NAME),
        attributeType: nodeTypeAttributeGr.getValue(DiagramBuilderNodeTypeAttribute.ATTRIBUTE_TYPE),
        nodeType: nodeTypeAttributeGr.getValue(DiagramBuilderNodeTypeAttribute.NODE_TYPE),
        sysId: nodeTypeAttributeGr.getUniqueValue()
    };
};

DiagramBuilderNodeTypeAttributeService.getAttributesByNodeTypeId = function(nodeTypeId) {
    var nodeTypeAttributeGr = DiagramBuilderNodeTypeAttribute.getAttributesByNodeTypeId(nodeTypeId);
    var nodeAttributes = [];
    while (nodeTypeAttributeGr.next()) {
        nodeAttributes.push(DiagramBuilderNodeTypeAttributeService._constructNodeTypeAttributeObject(nodeTypeAttributeGr));
    }

    return nodeAttributes;
};
