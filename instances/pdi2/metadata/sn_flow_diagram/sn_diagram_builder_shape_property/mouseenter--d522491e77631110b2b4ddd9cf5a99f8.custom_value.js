function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj, prev) {
        var linkPart = obj.part;
        var colorBackground = resolveThemeVariable("--now-color_background--tertiary") || "#E4E6E7";
        var FLOWLOGIC_GOBACKTO = "Go back to";

        // Find Catch node linked to a node, if any
        var findLinkedCatch = function(node, diagram) {
            var nextFromNode = node;
            while (nextFromNode) {
                var nextParentKey = nextFromNode.data.parent ||
                    (nextFromNode.data.relation && nextFromNode.data.relation.parent) ||
                    nextFromNode.data.endParallelNodeKey ||
                    nextFromNode.data.endDecisionNodeKey ||
                    nextFromNode.data.endCatchNodeKey;
                var parentNode = nextParentKey && diagram.findNodeForKey(nextParentKey);
                if (parentNode) {
                    // if TRY found, that means original node is a descendant, so use dotted link
                    if (parentNode.data.definition_type === 'TRY' &&
                        parentNode.data.connectedTo) {
                        // connecedTo key should be the Catch that's connected to this Try
                        return diagram.findNodeForKey(parentNode.data.connectedTo);
                    }
                } else if (nextParentKey) {
                    // parent is valid but node is not, means it's a node not shown in diagram (i.e. ELSE)
                    // find previous node instead by using link that goes to this node
                    var links = diagram.findLinksByExample({
                        to: nextFromNode.data.key
                    });
                    nextParentKey = links.first() && links.first().data.from;
                    parentNode = nextParentKey && diagram.findNodeForKey(nextParentKey);
                }
                nextFromNode = parentNode;
            }
            return null;
        };

        // Show highlight
        var flowLinkHighlight = linkPart.findObject('flowLinkHighlight');
        if (flowLinkHighlight) {
            flowLinkHighlight.stroke = colorBackground;
        }

        // Find 'from' and 'to' nodes
        var diagram = obj.diagram;
        var fromNode = diagram.findNodeForKey(linkPart.data.from);
        var toNode = diagram.findNodeForKey(linkPart.data.to);

        // highlight all Links and Nodes coming out of a given Node
        diagram.startTransaction("highlight");
        // remove any previous highlighting
        diagram.clearHighlighteds();

        if (fromNode.data.name !== FLOWLOGIC_GOBACKTO) {
            fromNode.isHighlighted = true;
        } else {
            // if GoBackTo highlight all converging links
            var goNodesList = [];
            diagram.nodes.each(function(node) {
                if (node.data.name === FLOWLOGIC_GOBACKTO) {
                    goNodesList.push(node.data.key);
                }
            });

            // for each Link coming out of the Node, set Link.isHighlighted
            var linksIt = toNode.findLinksInto();
            while (linksIt.next()) {
                var link = linksIt.value;
                linkPart = link.part;
                if (goNodesList.includes(link.data.from)) {
                    flowLinkHighlight = linkPart.findObject('flowLinkHighlight');
                    if (flowLinkHighlight) {
                        flowLinkHighlight.stroke = colorBackground;
                    }
                }
            }

            // for each Node destination for the Node, set Node.isHighlighted
            var nodesIt = toNode.findNodesInto();
            while (nodesIt.next()) {
                var node = nodesIt.value;
                if (goNodesList.includes(node.key)) {
                    node.isHighlighted = true;
                }
            }
        }

        // If there is a linked Catch, highlight that too
        var linkedCatch = findLinkedCatch(fromNode, diagram);
        if (linkedCatch) {
            linkedCatch.isHighlighted = true;
        }

        // Set isHighlighted to true
        toNode.isHighlighted = true;
        diagram.commitTransaction("highlight");
    };
}
