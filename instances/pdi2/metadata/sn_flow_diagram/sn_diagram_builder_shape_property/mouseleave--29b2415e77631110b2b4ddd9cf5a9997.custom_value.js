function getValue(go, dispatch, $) {
    return function(e, obj, prev) {
        var linkPart = obj.part;

        // Hide highlight
        var flowLinkHighlight = linkPart.findObject('flowLinkHighlight');
        if (flowLinkHighlight) {
            flowLinkHighlight.stroke = 'transparent';
        }

        // Find 'from' and 'to' nodes
        var diagram = obj.diagram;
        var toNode = diagram.findNodeForKey(linkPart.data.to);

        var goNodesList = [];
        diagram.nodes.each(function(node) {
            if (node.data.name === "Go back to") {
                goNodesList.push(node.data.key);
            }
        });

        var linksIt = toNode.findLinksInto();
        // Hide GoBackTo highlighted links
        while (linksIt.next()) {
            var link = linksIt.value;
            linkPart = link.part;
            if (goNodesList.includes(link.data.from)) {
                flowLinkHighlight = linkPart.findObject('flowLinkHighlight');
                if (flowLinkHighlight) {
                    flowLinkHighlight.stroke = 'transparent';
                }
            }
        }

        // Set isHighlighted to false
        diagram.clearHighlighteds(); // clears isHighlighted
    };
}
