function getValue(go, dispatch, $) {
    return function(e, port) {
        dispatch("GO_DIAGRAM#NODE_DYNAMIC_ADD_PORT_CLICKED", {
            data: {
                diagram: e.diagram,
                node: port.part,
                nodeKey: port.part.key,
                port: port,
                portId: port.portId,
                portDirection: port.data.direction,
            },
        });
    };
}
