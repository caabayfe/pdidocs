function removeNode(diagram, node, actionPropertyMap, dispatch) {
    // TODO: Deleting Conditional nodes needs, a lot of custom manipulation.
    // Update below code accordingly.
    diagram.commit(function(d) {
        // Get all links into this node.
        var linksInto = node.findLinksInto();
        // Get all links out of this node.
        var linksOutFrom = node.findLinksOutOf();

        // Get the then and else port ids.
        var connectors = actionPropertyMap[node.data.node_id].connectors;
        var thenPortId, elsePortId;
        for (var i = 0; i < connectors.length; i++) {
            if (connectors[i].direction === "output") {
                if (connectors[i].name === "Then")
                    thenPortId = connectors[i].sysId;
                else
                    elsePortId = connectors[i].sysId;
            }
        }

        // Get all immediate nodes connecting out from then and else ports.
        var nextNodeOutOfThenItr = node.findNodesOutOf(thenPortId);
        var nextNodeDataOutOfThen = nextNodeOutOfThenItr && nextNodeOutOfThenItr.count > 0 ? nextNodeOutOfThenItr.value.data : null;
        var nextNodeOutOfElseItr = node.findNodesOutOf(elsePortId);
        var nextNodeDataOutOfElse = nextNodeOutOfElseItr && nextNodeOutOfElseItr.count > 0 ? nextNodeOutOfElseItr.value.data : null;

        // For each link to deleted node, update to and toPort properties to those of deleted node's next node.
        var links = [];
        linksInto.each(function(link) {
            links.push(link.data);
        });
        if (nextNodeDataOutOfThen) {
            var actionId = nextNodeDataOutOfThen.node_id;

            // Get the toPort ID of next node from then port. Take the first connector with direction input.
            var nextNodeConnectors = actionPropertyMap[actionId].connectors;
            var toConnector;
            for (var j = 0; j < nextNodeConnectors.length; j++) {
                if (nextNodeConnectors[j].direction === "input") {
                    toConnector = nextNodeConnectors[j];
                    break;
                }
            }
            var toPortId = toConnector ? toConnector.sysId : null;
            links.forEach(function(link) {
                d.model.setDataProperty(link, 'to', nextNodeDataOutOfThen.key);
                if (toPortId)
                    d.model.setDataProperty(link, 'toPort', toPortId);
            });
        } else {
            var linkKeys = [];

            // If next node is not available, delete all links into this node, as they would be dangling after deleting the node.
            // Remove all links coming out of this node.
            links.forEach(function(link) {
                d.model.removeLinkData(link);
                if (link.key)
                    linkKeys.push(link.key);
            });

            // Remove the edge arguments associated to the removed links
            if (linkKeys.length > 0) {
                dispatch("DIAGRAMDATA#DIAGRAM_JSON_UPDATED", {
                    action: 'argument-delete',
                    data: {
                        keys: linkKeys,
                        isEdge: true,
                    },
                });
            }
        }

        var outLinks = [];
        var outLinkKeys = [];
        linksOutFrom.each(function(link) {
            outLinks.push(link.data);
            if (link.key)
                outLinkKeys.push(link.key);
        });
        // Remove all links coming out of this node.
        outLinks.forEach(function(link) {
            d.model.removeLinkData(link);
        });

        // Remove the edge arguments associated to the removed links
        if (outLinkKeys.length > 0) {
            dispatch("DIAGRAM_DATA#DIAGRAM_JSON_UPDATED", {
                action: 'argument-delete',
                data: {
                    keys: outLinkKeys,
                    isEdge: true,
                },
            });
        }

        // Remove condition node itself.
        d.model.removeNodeData(node.data);

        // Remove subtree, coming out of else branch.
        //const subtreeFromElse = nextNodeOutOfElse.findTreeParts();

        //d.removeParts(nextNodeOutOfElse.findTreeParts());
        // Remove node out of else port.
        //d.model.removeNodeData(nextNodeOutOfElse);

    }, 'Removing Condition node from diagram');
}
