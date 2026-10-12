function getBinding(go, source, target, dispatch, resolveThemeVariable, getTranslatedMessage) {
    /**
     * If the node has siblings (under the same parent) then get the sibling directly to the left of the node.
     */
    function getNodeLeftSibling(node) {
        if (node) {
            const nodeKey = (node && node.data ? node.data.key : null);
            var siblingNodeToLeft = null;
            var siblingLinkToLeft = null;
            const parentNode = node.findTreeParentNode();
            if (parentNode) {
                // Find links from the parent node.
                const parentKey = (parentNode && parentNode.data ? parentNode.data.key : null);
                const diagram = node.diagram;
                const model = diagram.model;
                const links = model.linkDataArray.filter((link) => link.from === parentKey);
                for (var i = 0; i < links.length; i++) {
                    // Stop looking when we reach the current node.
                    const linkdata = links[i];
                    if (linkdata.to === nodeKey) {
                        if (siblingLinkToLeft) {
                            siblingNodeToLeft = diagram.findNodeForKey(siblingLinkToLeft.to);
                            return siblingNodeToLeft;
                        }
                        break; // There is no sibling to the left,
                    }
                    // Keep track of the previous sibling.
                    siblingLinkToLeft = linkdata;
                }
            }
        }
        return null;
    }
    /**
     * If the node has siblings (under the same parent) then get the key of the sibling directly to the left of the node.
     */
    function getNodeLeftSiblingKey(node) {
        const siblingNode = getNodeLeftSibling(node);
        if (siblingNode && siblingNode.data && siblingNode.data.key) {
            return siblingNode.data.key;
        }
        return null;
    }
    /**
     * Can the moving node be moved to the right of the target node.
     */
    function canMoveToTheRightOf(targetNode, movingNode) {
        if (!movingNode || !(targetNode.findTreeParentNode())) return false;
		if (movingNode.data._isPaletteNode) return true;
        const movingNodeKey = (movingNode && movingNode.data && movingNode.data.key ? movingNode.data.key : null);
        const targetNodeKey = (targetNode && targetNode.data && targetNode.data.key ? targetNode.data.key : null);
		if(movingNodeKey === targetNodeKey || targetNode.isInTreeOf(movingNode)) return false;

        // Can move a Why to the right of a Why target node when the target node is not the right sibling of the node being moved.
        const siblingKey = getNodeLeftSiblingKey(movingNode);
        return targetNodeKey !== siblingKey;
    }

    return new go.Binding(target, source, function(_isDraggingInProgress, obj) {
        if (obj.diagram.model.modelData._isPaletteNode) return false;
        if (_isDraggingInProgress && canMoveToTheRightOf(obj.part, obj.diagram.toolManager.draggingTool.movingNode)) return true;
        return false;
    }).ofModel();
}
