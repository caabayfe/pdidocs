var DiagramBuilderConnectorPort = Class.create();

// table name
DiagramBuilderConnectorPort.TABLE = 'sn_diagram_builder_connector_port';

// table fields
DiagramBuilderConnectorPort.SHAPE_TEMPLATE = 'shape_template';
DiagramBuilderConnectorPort.SPOT = 'spot';
DiagramBuilderConnectorPort.ACTIVE = 'active';
DiagramBuilderConnectorPort.PORT_OFFSET_X = 'port_offset_x';
DiagramBuilderConnectorPort.PORT_OFFSET_Y = 'port_offset_y';

// initialize script include by extending Crud base
DiagramBuilderConnectorPort.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderConnectorPort.TABLE;
    },
    type: 'DiagramBuilderConnectorPort'
});

DiagramBuilderConnectorPort.getPortById = function(portId) {
    return new DiagramBuilderConnectorPort().getById(portId);
};
