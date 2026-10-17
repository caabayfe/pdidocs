var DiagramBuilderNodeType = Class.create();

// table name
DiagramBuilderNodeType.TABLE = 'sn_diagram_builder_node_type';

// table fields
DiagramBuilderNodeType.ACTIVE = 'active';
DiagramBuilderNodeType.DESCRIPTION = 'description';
DiagramBuilderNodeType.ICON = 'icon';
DiagramBuilderNodeType.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderNodeType.NODE_TYPE = 'node_type';
DiagramBuilderNodeType.ALLOW_DELETE = 'allow_delete';


// initialize script include by extending Crud base
DiagramBuilderNodeType.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderNodeType.TABLE;
    },
    type: 'DiagramBuilderNodeType'
});

DiagramBuilderNodeType.getNodeTypeById = function(nodeTypeId) {
    return new DiagramBuilderNodeType().getById(nodeTypeId);
};
