function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
        var parent = graphObject.part.findObject('flowTryParentNode');
        var isSelfSelected = graphObject.isSelected || graphObject.isHighlighted || graphObject.data.isSelected;
        if ((parent && parent.isSelected) || isSelfSelected) {
            return 'rgb(179, 151, 206)';
        } else {
            return 'rgb(233, 225, 241)';
        }
    }).ofObject();
}
