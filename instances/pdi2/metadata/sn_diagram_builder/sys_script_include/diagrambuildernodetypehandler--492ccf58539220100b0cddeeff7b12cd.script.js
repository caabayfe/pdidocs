var DiagramBuilderNodeTypeHandler = Class.create();

// table name
DiagramBuilderNodeTypeHandler.TABLE = 'sn_diagram_builder_node_type_handler';

// table fields
DiagramBuilderNodeTypeHandler.ACTIVE = 'active';
DiagramBuilderNodeTypeHandler.TYPE = 'type';
DiagramBuilderNodeTypeHandler.SCRIPT = 'script';
DiagramBuilderNodeTypeHandler.NODE_TYPE = 'node_type';


// initialize script include by extending Crud base
DiagramBuilderNodeTypeHandler.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderNodeTypeHandler.TABLE;
    },
    type: 'DiagramBuilderNodeTypeHandler'
});

DiagramBuilderNodeTypeHandler.getNodeTypeById = function(nodeTypeId) {
    return new DiagramBuilderNodeTypeHandler().getById(nodeTypeId);
};

DiagramBuilderNodeTypeHandler.getNodeTypeHandlersByNodeId = function(nodeTypeId) {
    var encodedQuery = DiagramBuilderNodeTypeHandler.ACTIVE + '=true^' + DiagramBuilderNodeTypeHandler.NODE_TYPE + '=' + nodeTypeId;
    return new DiagramBuilderNodeTypeHandler().getByQuery(encodedQuery);
};
