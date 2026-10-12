var DiagramBuilderConnectorPortService = Class.create();

DiagramBuilderConnectorPortService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderConnectorPortService',
};

DiagramBuilderConnectorPortService._constructPortObject = function(portGr) {
    if (portGr.isValidRecord())
        return {
            shapeTemplate: portGr.getValue(DiagramBuilderConnectorPort.SHAPE_TEMPLATE),
            active: portGr.getValue(DiagramBuilderConnectorPort.ACTIVE) === "1",
            spot: DiagramBuilderSpotService.getSpotById(portGr.getValue(DiagramBuilderConnectorPort.SPOT)), // Fetch spot configuration for this port.
            offsetX: isNaN(portGr.getValue(DiagramBuilderConnectorPort.PORT_OFFSET_X)) ? 0 : portGr.getValue(DiagramBuilderConnectorPort.PORT_OFFSET_X),
            offsetY: isNaN(portGr.getValue(DiagramBuilderConnectorPort.PORT_OFFSET_Y)) ? 0 : portGr.getValue(DiagramBuilderConnectorPort.PORT_OFFSET_Y)
        };
    else
        return null;
};

DiagramBuilderConnectorPortService.getPortById = function(portId) {
    var portGr = DiagramBuilderConnectorPort.getPortById(portId);
    return DiagramBuilderConnectorPortService._constructPortObject(portGr);
};
