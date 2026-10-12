function showMenuOption(diagram, node, actionPropertyMap) {
    //Add code to control visibility of this option
    if (node.data.flowIsReadOnly || (!node.data.comment || node.data.comment == "")) {
        return false;
    } else
        return true;
}
