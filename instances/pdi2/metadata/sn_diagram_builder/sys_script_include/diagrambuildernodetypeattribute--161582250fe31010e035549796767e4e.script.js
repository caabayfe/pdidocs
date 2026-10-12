var DiagramBuilderNodeTypeAttribute = Class.create();

// table name
DiagramBuilderNodeTypeAttribute.TABLE = 'sn_diagram_builder_node_type_attribute';

// table fields
DiagramBuilderNodeTypeAttribute.ATTRIBUTE_NAME = 'attribute_name';
DiagramBuilderNodeTypeAttribute.ATTRIBUTE_TYPE = 'attribute_type';
DiagramBuilderNodeTypeAttribute.NODE_TYPE = 'node_type';

// initialize script include by extending Crud base
DiagramBuilderNodeTypeAttribute.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderNodeTypeAttribute.TABLE;
    },
    type: 'DiagramBuilderNodeTypeAttribute'
});

DiagramBuilderNodeTypeAttribute.getAttributesByNodeTypeId = function(nodeTypeId) {
    var encodedQuery = DiagramBuilderNodeTypeAttribute.NODE_TYPE + '=' + nodeTypeId;
    return new DiagramBuilderNodeTypeAttribute().getByQuery(encodedQuery);
};
