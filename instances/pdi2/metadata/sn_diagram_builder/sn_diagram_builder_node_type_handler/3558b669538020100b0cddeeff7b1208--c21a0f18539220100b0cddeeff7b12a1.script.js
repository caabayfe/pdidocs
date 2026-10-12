function addNode(diagram, newNodeData, newNodeConnectors, linkData, shapeTemplatePropertyMap, uuidv4, generateEdgeKey, additionalProps) {
    const {
        dragAndDropTriggered,
    } = additionalProps;
    var _constructPlaceholderNodeData = function() {
        var placeholderActionData = newNodeData.actionDependencies[0].action;
        var templateId = placeholderActionData.nodeType.sysId;
        // FIXME: Construct this from action dependencies, instead of defining static values.
        return Object.assign({
            key: uuidv4(),
            _isInvalid: false,
            node_id: placeholderActionData.sysId,
            templateId: templateId,
            name: placeholderActionData.name,
            nodeCategory: placeholderActionData.category,
            nodeSubCategory: placeholderActionData.subCategory,
            icon: placeholderActionData.icon,
            group: newNodeData.group
        }, shapeTemplatePropertyMap[templateId]);
    };
    diagram.model.commit(function(model) {
        //debugger;
        if (linkData) {
            var nextNodeToPort = linkData.toPort;
            if (!dragAndDropTriggered)
                // Add new node to the diagram.
                model.addNodeData(newNodeData);
            // Extract one input and two output ports (then/ else) of the condition node.
            var toConnector, thenPortConnector, elsePortConnector;
            for (var i = 0; i < newNodeConnectors.length; i++) {
                if (newNodeConnectors[i].direction === "input")
                    toConnector = newNodeConnectors[i];
                else {
                    if (newNodeConnectors[i].name === "Then")
                        thenPortConnector = newNodeConnectors[i];
                    else
                        elsePortConnector = newNodeConnectors[i];
                }
            }

            var nextNode = diagram.findNodeForKey(linkData.to);

            // Construct placeholder nodes coming out from then/else ports.
            var thenPlaceholder = _constructPlaceholderNodeData();
            var elsePlaceholder = _constructPlaceholderNodeData();

            // "Add If node" behavior is determined based on whether next node is end node or not.
            // So we need to first determine that.
            // Next node is end only when we don't find a from link with next node's key
            var nextActionNodeItr = diagram.findLinksByExample({
                from: nextNode.key
            });
            var nextNodeIsEnd = !nextActionNodeItr || nextActionNodeItr.count === 0;

            // Create link data that connects then port of if node to the next node.
            // If next node is end node, then connect to this to then placeholder node.
            // Otherwise connect to next node itself.
            var newLinkDataFromThenPort = Object.assign({
                    from: newNodeData.key,
                    to: nextNodeIsEnd ? thenPlaceholder.key : linkData.to,
                    templateId: linkData.templateId,
                    edge_id: linkData.edge_id,
                }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
            );
            var newLinkDataFromThenPlaceholderNode = null;
            if (nextNodeIsEnd)
                newLinkDataFromThenPlaceholderNode = Object.assign({
                        from: thenPlaceholder.key,
                        to: linkData.to,
                        templateId: linkData.templateId,
                        edge_id: linkData.edge_id,
                    }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
                );
            // Add then port ID as fromPort property to the new link.
            newLinkDataFromThenPort.fromPort = thenPortConnector.sysId;
            // If to port is available for the next node, add toPort property to the new link.
            if (nextNodeToPort) {
                if (nextNodeIsEnd)
                    newLinkDataFromThenPlaceholderNode.toPort = nextNodeToPort;
                else
                    newLinkDataFromThenPort.toPort = nextNodeToPort;
            }

            if (nextNodeIsEnd) {
                model.addNodeData(thenPlaceholder);
                if (generateEdgeKey)
                    Object.assign(newLinkDataFromThenPlaceholderNode, {
                        key: uuidv4()
                    });
                model.addLinkData(newLinkDataFromThenPlaceholderNode);
            }
            if (generateEdgeKey)
                Object.assign(newLinkDataFromThenPort, {
                    key: uuidv4()
                });
            model.addLinkData(newLinkDataFromThenPort);

            // Create link data that connects else port of if node to the next node.
            var newLinkDataFromElsePort = Object.assign({
                    from: newNodeData.key,
                    to: elsePlaceholder.key,
                    templateId: linkData.templateId,
                    edge_id: linkData.edge_id,
                }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
            );

            // If next node is not end node, we need to connect else node's placeholder to next action node.
            var nextActionNodeLinkData = null;
            if (!nextNodeIsEnd)
                nextActionNodeLinkData = nextActionNodeItr.first().data;
            var newLinkDataFromElsePlaceholderNode = Object.assign({
                    from: elsePlaceholder.key,
                    to: nextNodeIsEnd ? linkData.to : nextActionNodeLinkData.to,
                    templateId: linkData.templateId,
                    edge_id: linkData.edge_id,
                }, shapeTemplatePropertyMap[linkData.templateId] // Shape template visual properties.
            );
            if (generateEdgeKey) {
                Object.assign(newLinkDataFromElsePort, {
                    key: uuidv4()
                });
                Object.assign(newLinkDataFromElsePlaceholderNode, {
                    key: uuidv4()
                });
            }
            // Add else port ID as fromPort property to the new link.
            newLinkDataFromElsePort.fromPort = elsePortConnector.sysId;
            // If to port is available for the next node, add toPort property to the new link.
            if (nextNodeIsEnd) {
                if (nextNodeToPort)
                    newLinkDataFromElsePlaceholderNode.toPort = nextNodeToPort;
            } else {
                if (nextActionNodeLinkData && nextActionNodeLinkData.toPort)
                    newLinkDataFromElsePlaceholderNode.toPort = nextActionNodeLinkData.toPort;
            }

            // Add placeholder node from Else port.
            model.addNodeData(elsePlaceholder);
            // Add new link from else port to placeholder node.
            model.addLinkData(newLinkDataFromElsePort);
            // Add new link from else placeholder node to next node.
            model.addLinkData(newLinkDataFromElsePlaceholderNode);
            // Relink existing link to new node.
            model.setDataProperty(linkData, 'to', newNodeData.key);
            // If to connector is available for the new node, add toPort property to the existing link.
            model.setDataProperty(linkData, 'toPort', toConnector.sysId);
        } else
            model.addNodeData(newNodeData); // Add new node to the diagram.
    }, "Adding Condition node to the diagram");
}
