function getBinding(go, source, target, dispatch, resolveThemeVariable, getTranslatedMessage) {
    /**
     * If the node has siblings (under the same parent) then get the sibling directly to the right of the node.
     */
    function getNodeRightSibling(node) {
        if (node) {
            const nodeKey = (node && node.data ? node.data.key : null);
            const parentNode = node.findTreeParentNode();
            if (parentNode) {
                // Find links from the parent node.
                const parentKey = (parentNode && parentNode.data ? parentNode.data.key : null);
                const diagram = node.diagram;
                const model = diagram.model;
                const links = model.linkDataArray.filter((link) => link.from === parentKey);
                var foundNodeLink = false;
                for (var i = 0; i < links.length; i++) {
                    // Stop looking when we reach the current node.
                    const linkdata = links[i];
                    if (linkdata.to === nodeKey) {
                        foundNodeLink = true;
                        // Move to the next sibling.
                        continue;
                    }

                    // Stop looking as we found the sibling after the node.
                    if (foundNodeLink) {
                        var siblingNodeToRight = diagram.findNodeForKey(linkdata.to);
                        return siblingNodeToRight;
                    }
                }
            }
        }
        return null;
    }
    /**
     * If the node has siblings (under the same parent) then get the key of the sibling directly to the right of the node.
     */
    function getNodeRightSiblingKey(node) {
        const siblingNode = getNodeRightSibling(node);
        if (siblingNode && siblingNode.data && siblingNode.data.key) {
            return siblingNode.data.key;
        }
        return null;
    }
    /**
     * Can the moving node be moved to the left of the target node.
     */
    function canMoveToTheLeftOf(targetNode, movingNode) {
        if (!movingNode || !(targetNode.findTreeParentNode())) return false;
        if (movingNode.data._isPaletteNode) return true;
        const movingNodeKey = (movingNode && movingNode.data && movingNode.data.key ? movingNode.data.key : null);
        const targetNodeKey = (targetNode && targetNode.data && targetNode.data.key ? targetNode.data.key : null);

        if ((movingNodeKey === targetNodeKey) || targetNode.isInTreeOf(movingNode)) return false;
        // Can move a Why to the left of a Why target node when the target node is not the left sibling of the node being moved.
        const siblingKey = getNodeRightSiblingKey(movingNode);
        return targetNodeKey !== siblingKey;
    }
    return new go.Binding(target, source, function(_isDraggingInProgress, obj) {
        if (obj.diagram.model.modelData._isPaletteNode) return false;
        if (_isDraggingInProgress && canMoveToTheLeftOf(obj.part, obj.diagram.toolManager.draggingTool.movingNode)) return true;
        return false;
    }).ofModel();
}
