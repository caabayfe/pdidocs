function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
        return new go.Margin(0, 8, 0, 8);
    });
}
