var DiagramBuilderNodeConnectorService = Class.create();
DiagramBuilderNodeConnectorService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderNodeConnectorService'
};

DiagramBuilderNodeConnectorService._constructNodeConnectorObject = function(nodeConnectorGr) {
    return {
        active: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.ACTIVE) === "1",
        name: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.NAME),
        direction: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.DIRECTION),
        connectorPort: DiagramBuilderConnectorPortService.getPortById(nodeConnectorGr.getValue(DiagramBuilderNodeConnector.CONNECTOR_PORT)),
        order: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.ORDER),
        sysId: nodeConnectorGr.getUniqueValue(),
        fromMaxLinks: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.FROM_MAX_LINKS),
        toMaxLinks: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.TO_MAX_LINKS),
        isDynamic: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.IS_DYNAMIC) == "1",
        enablePortContextMenu: nodeConnectorGr.getValue(DiagramBuilderNodeConnector.ENABLE_PORT_CONTEXT_MENU) == "1",
    };
};

DiagramBuilderNodeConnectorService.getNodeConnectorById = function(nodeConnectorId) {
    var nodeConnectorGr = DiagramBuilderNodeConnector.getNodeTypeById(nodeConnectorId);
    return DiagramBuilderNodeConnectorService._constructNodeTypeObject(nodeConnectorGr);
};

DiagramBuilderNodeConnectorService.getNodeConnectorsByType = function(nodeTypeId) {
    var connectors = [];
    var nodeConnectorGr = DiagramBuilderNodeConnector.getNodeConnectorsByType(nodeTypeId);
    while (nodeConnectorGr.next()) {
        connectors.push(DiagramBuilderNodeConnectorService._constructNodeConnectorObject(nodeConnectorGr));
    }
    return connectors;
};
