function droppedNode(diagram, newNodeData, newNodeConnectors, linkData, shapeTemplatePropertyMap, uuidv4, generateEdgeKey, additionalProps) {
    const {
        nodeTypeHandlers,
    } = additionalProps;
    diagram.model.commit(function(model) {
        if (linkData) {
            const {
                to,
                edge_id,
                toPort: nextNodeToPort,
                templateId: linkShapeTemplate,
            } = linkData;
            // For action node, pick first input connector for
            // toPort and first output connector for fromPort.
            const toConnector = newNodeConnectors.find(
                connector => connector.direction === 'input',
            );
            const fromConnector = newNodeConnectors.find(
                connector => connector.direction === 'output',
            );
            // Set item arrays if input connectors are dynamic
            const inputPortId = uuidv4();
            if (toConnector?.isDynamic) {
                newNodeData['input_ports'] = [{
                    portId: inputPortId,
                    direction: 'input',
                }, ];
            }
            // Set item arrays if output connectors are dynamic
            const outputPortId = uuidv4();
            if (fromConnector?.isDynamic) {
                newNodeData['output_ports'] = [{
                    portId: outputPortId,
                    direction: 'output',
                }, ];
            }
            // Create link data that connects new node to the next node.
            const newLinkData = {
                from: newNodeData.key,
                to,
                templateId: linkShapeTemplate,
                edge_id,
                ...shapeTemplatePropertyMap[linkShapeTemplate], // Shape template visual properties.
                // ...getActionCustomProperties(),
            };
            if (generateEdgeKey)
                Object.assign(newLinkData, {
                    key: uuidv4()
                });
            // If from connector is available for the new node, add fromPort property to the new link.
            if (fromConnector) {
                newLinkData.fromPort = fromConnector.isDynamic ?
                    outputPortId :
                    fromConnector.sysId;
            }
            // If to port is available for the next node, add toPort property to the new link.
            if (nextNodeToPort)
                newLinkData.toPort = nextNodeToPort;
            
            // Skip link creation for the Loop node, as this operation is already handled in the 'addNodeHandler' for the Loop node type.
            if (!(newNodeData?.nodeType?.nodeType == 'Loop')) {
                // Add new link to the diagram
                model.addLinkData(newLinkData);
            }
            // Relink existing link to new node.
            model.setDataProperty(linkData, 'to', newNodeData.key);
            // If to connector is available for the new node, add toPort property to the existing link.
            if (toConnector) {
                model.setDataProperty(
                    linkData,
                    'toPort',
                    toConnector.isDynamic ?
                    inputPortId :
                    toConnector.sysId
                );
            } else
                model.setDataProperty(linkData, 'toPort', null);
            linkData = newLinkData;
        }
        //Add code to perform action when a node is dropped on to another node or link
    }, 'Dropping node on another node or link');

    var addNodeHandler = nodeTypeHandlers.find(function(handler) {
        return handler.type === 'add';
    });
    if (addNodeHandler) {
        //If addhandler is available for the node that is getting dropped, execute the same.
        new Function(`return ${addNodeHandler.script}`)()(
            diagram,
            newNodeData,
            newNodeConnectors,
            linkData,
            shapeTemplatePropertyMap,
            uuidv4,
            generateEdgeKey,
            additionalProps,
        );
    }
}
