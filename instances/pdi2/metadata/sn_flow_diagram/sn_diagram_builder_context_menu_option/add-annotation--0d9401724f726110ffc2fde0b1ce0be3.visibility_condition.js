function showMenuOption(diagram, node, actionPropertyMap) {
    //Add code to control visibility of this option
    if (node.data.commentsEnabled && !node.data.flowIsReadOnly && !node.data.comment) {
        return true;
    }
    return false;
}
