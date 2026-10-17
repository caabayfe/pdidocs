var DiagramBuilderNodeConnector = Class.create();

// table name
DiagramBuilderNodeConnector.TABLE = 'sn_diagram_builder_node_connector';

// table fields
DiagramBuilderNodeConnector.ACTIVE = 'active';
DiagramBuilderNodeConnector.NAME = 'name';
DiagramBuilderNodeConnector.DIRECTION = 'direction';
DiagramBuilderNodeConnector.ORDER = 'order';
DiagramBuilderNodeConnector.CONNECTOR_PORT = 'shape_port';
DiagramBuilderNodeConnector.FROM_MAX_LINKS = 'from_max_links';
DiagramBuilderNodeConnector.TO_MAX_LINKS = 'to_max_links';
DiagramBuilderNodeConnector.IS_DYNAMIC = 'is_dynamic';
DiagramBuilderNodeConnector.ENABLE_PORT_CONTEXT_MENU = 'enable_port_context_menu';

// initialize script include by extending Crud base
DiagramBuilderNodeConnector.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderNodeConnector.TABLE;
    },
    type: 'DiagramBuilderNodeConnector'
});

DiagramBuilderNodeConnector.getNodeConnectorById = function(nodeConnectorId) {
    return new DiagramBuilderNodeConnector().getById(nodeConnectorId);
};

DiagramBuilderNodeConnector.getNodeConnectorsByType = function(nodeTypeId) {
    return new DiagramBuilderNodeConnector().getByQuery('node_type=' + nodeTypeId + '^active=true');
};
