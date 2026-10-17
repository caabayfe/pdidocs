function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
        return NaN;
    }).ofObject();
}
