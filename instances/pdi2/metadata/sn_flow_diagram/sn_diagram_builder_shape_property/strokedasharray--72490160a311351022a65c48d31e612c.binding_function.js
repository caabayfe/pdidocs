function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(linkData, graphObject) {
        var dottedValues = [5, 6];
        var fromNode = graphObject.diagram.findNodeForKey(linkData.from);

        var nextFromNode = fromNode;
		// iterate upwards, looking for a parent node that is a TRY
        while (nextFromNode) {
            var nextParentKey = nextFromNode.data.parent ||
                (nextFromNode.data.relation && nextFromNode.data.relation.parent) ||
                nextFromNode.data.endParallelNodeKey ||
                nextFromNode.data.endDecisionNodeKey ||
                nextFromNode.data.endCatchNodeKey;
            var parentNode = nextParentKey && graphObject.diagram.findNodeForKey(nextParentKey);
            if (parentNode) {
				// if TRY found, that means original node is a descendant, so use dotted link
                if (parentNode.data.definition_type === 'TRY') {
                    return dottedValues;
                }
            } else if (nextParentKey) {
                // parent is valid but node is not, means it's a node not shown in diagram (i.e. ELSE)
                // find previous node instead by using link that goes to this node
                var links = graphObject.diagram.findLinksByExample({
                    to: nextFromNode.data.key
                });
                nextParentKey = links.first() && links.first().data.from;
                parentNode = nextParentKey && graphObject.diagram.findNodeForKey(nextParentKey);
            }
            nextFromNode = parentNode;

        }
        return null;
    });
}
