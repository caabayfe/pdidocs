function removeNode(diagram, node, actionPropertyMap, dispatch) {
    diagram.commit(function(d) {
        //d.remove(node);
        d.removeParts(node.memberParts);
        // Get all links into this node.
        var linksInto = node.findLinksInto();
        var linksOutFrom = node.findLinksOutOf();
        // Get immediate node connecting out from this node.
        var nodeOutOfItr = node.findNodesOutOf();
        var nextNode = nodeOutOfItr && nodeOutOfItr.count > 0 ? nodeOutOfItr.value.data : null;

        // Extract link data for each link node.
        var links = [];
        linksInto.each(function(link) {
            links.push(link.data);
        });
        if (nextNode) {
            var actionId = nextNode.node_id;

            // Get the toPort ID of next node. Take the first connector with direction input.
            var connectors = actionPropertyMap[actionId].connectors;
            var toConnector = null;
            for (var i = 0; i < connectors.length; i++) {
                if (connectors[i].direction === "input") {
                    toConnector = connectors[i];
                    break;
                }

            }
            var toPortId = toConnector ? toConnector.sysId : null;
            // For each link to deleted node, update to and toPort properties to those of deleted node's next node.
            links.forEach(function(link) {
                d.model.setDataProperty(link, 'to', nextNode.key);
                if (toPortId)
                    d.model.setDataProperty(link, 'toPort', toPortId);
            });
        } else {
            var linkKeys = [];

            // If next node is not available, delete all links into this node, as they would be dangling after deleting the node.
            links.forEach(function(link) {
                d.model.removeLinkData(link);
                if (link.key)
                    linkKeys.push(link.key);
            });

            // Remove the edge arguments associated to the deleted links
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
        });
        // Remove all links coming out of this node.
        outLinks.forEach(function(link) {
            d.model.removeLinkData(link);
            if (link.key)
                outLinkKeys.push(link.key);
        });

        // Remove the edge arguments associated to the deleted links
        if (outLinkKeys.length > 0) {
            dispatch("DIAGRAM_DATA#DIAGRAM_JSON_UPDATED", {
                action: 'argument-delete',
                data: {
                    keys: outLinkKeys,
                    isEdge: true,
                },
            });
        }

        // Remove action node itself.
        d.model.removeNodeData(node.data);

    }, 'Removing Loop node from the diagram');
}
