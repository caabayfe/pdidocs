function addNode(diagram, newNodeData, newNodeConnectors, linkData, shapeTemplatePropertyMap, uuidv4, generateEdgeKey, additionalProps) {
    const {
        dragAndDropTriggered,
    } = additionalProps;
    var _addLoopTemplate = function() {
        var startNodeData = newNodeData.actionDependencies[0].action;
        var endNodeData = newNodeData.actionDependencies[1].action;
        diagram.model.commit(function(model) {
            // Now that we added loop node to the diagram, add Start and end nodes to the loop node.
            var startNodeKey = uuidv4();
            var endNodeKey = uuidv4();
            var startNodeTemplateId = startNodeData.nodeType.sysId;
            var endNodeTemplateId = endNodeData.nodeType.sysId;
            var startNode = Object.assign({
                    key: startNodeKey,
                    node_id: startNodeData.sysId,
                    name: startNodeData.name,
                    icon: startNodeData.icon,
                    templateId: startNodeTemplateId,
                    group: newNodeData.key,
                    nodeCategory: startNodeData.category,
                    nodeSubCategory: startNodeData.subCategory

                }, shapeTemplatePropertyMap[startNodeTemplateId] // Shape template visual properties.
            );
            var endNode = Object.assign({
                    key: endNodeKey,
                    node_id: endNodeData.sysId,
                    name: endNodeData.name,
                    icon: endNodeData.icon,
                    templateId: endNodeTemplateId,
                    group: newNodeData.key,
                    nodeCategory: endNodeData.category,
                    nodeSubCategory: endNodeData.subCategory

                }, shapeTemplatePropertyMap[startNodeTemplateId] // Shape template visual properties.
            );

            // Create link data that connects start and end node.
            if (linkData) {
                var linkFromStartToEnd = Object.assign({
                        from: startNodeKey,
                        to: endNodeKey,
                        templateId: linkData.templateId,
                        edge_id: linkData.edge_id,
                        fromPort: '49de92bc535c20100b0cddeeff7b12f9',
                        toPort: 'c0bed67c535c20100b0cddeeff7b12fc',
                    }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
                );
                model.addNodeData(startNode);
                model.addNodeData(endNode);
                if (generateEdgeKey) {
                    Object.assign(linkFromStartToEnd, {
                        key: uuidv4()
                    });
                }
                model.addLinkData(linkFromStartToEnd);
            }
        }, "Adding loop start and end nodes to the loop node");
    };
    diagram.model.commit(function(model) {
        //debugger;
        if (linkData) {
            var nextNodeToPort = linkData.toPort;
            if (!dragAndDropTriggered)
                model.addNodeData(newNodeData); // Add new node to the diagram.

            // Extract input/ output connectors of loop node.
            var toConnector, fromConnector, elsePortConnector;

            for (var i = 0; i < newNodeConnectors.length; i++) {
                if (newNodeConnectors[i].direction === "input")
                    toConnector = newNodeConnectors[i];
                else if (newNodeConnectors[i].direction === "output") {
                    fromConnector = newNodeConnectors[i];
                }
            }

            // Create link data that connects new node to the next node.
            var newLinkData = Object.assign({
                    from: newNodeData.key,
                    to: linkData.to,
                    templateId: linkData.templateId,
                    edge_id: linkData.edge_id,
                }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
            );

            // If from connector is available for the new node, add fromPort property to the new link.
            if (fromConnector)
                newLinkData.fromPort = fromConnector.sysId;
            // If to port is available for the next node, add toPort property to the new link.
            if (nextNodeToPort)
                newLinkData.toPort = nextNodeToPort;

            if (generateEdgeKey) {
                Object.assign(newLinkData, {
                    key: uuidv4()
                });
            }
            //Add new link from then port to the diagram
            model.addLinkData(newLinkData);

            // Relink existing link to new node.
            model.setDataProperty(linkData, 'to', newNodeData.key);
            // If to connector is available for the new node, add toPort property to the existing link.
            model.setDataProperty(linkData, 'toPort', toConnector.sysId);
        } else
            model.addNodeData(newNodeData); // Add new node to the diagram.
    }, "Adding Loop node to the diagram");
    _addLoopTemplate();
}
