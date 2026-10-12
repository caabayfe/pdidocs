function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var onNodeAddedScript = "function addNode(diagram, newNodeData, newNodeConnectors, linkData, shapeTemplatePropertyMap, uuidv4, generateEdgeKey, additionalProps) {\n\tdiagram.model.commit(function(model) {\n\n\t\t//Add code to add node to the diagram\n\n\t}, 'Adding node to the diagram'); \n}";
    var onNodeRemovedScript = "function removeNode(diagram, node, actionPropertyMap, dispatch, additionalProps) {\n\tdiagram.model.commit(function(model) {\n\n\t\t//Add code to remove node from the diagram\n\n\t}, 'Removing node from the diagram');\n}";
    var onNodeDroppedScript = "function droppedNode(diagram, newNodeData, newNodeConnectors, linkData, shapeTemplatePropertyMap, uuidv4, generateEdgeKey, additionalProps) {\n\tdiagram.model.commit(function(model) {\n\n\t\t//Add code to perform action when a node is dropped on to another node or link\n\n\t}, 'Dropping node on another node or link');\n}";
    if (isLoading || newValue === '') {
        return;
    }
    var currentScript = g_form.getValue('script');

    // Don't change script on type change, when we already have some non-default value.
    if (currentScript !== onNodeAddedScript && currentScript !== onNodeRemovedScript && currentScript !== onNodeDroppedScript) {
        return;
    }

    if (newValue === "add") {
        g_form.setValue('script', onNodeAddedScript);
    } else if (newValue === "remove") {
        g_form.setValue('script', onNodeRemovedScript);
    } else if (newValue === "dropped") {
        g_form.setValue('script', onNodeDroppedScript);
    }
}
