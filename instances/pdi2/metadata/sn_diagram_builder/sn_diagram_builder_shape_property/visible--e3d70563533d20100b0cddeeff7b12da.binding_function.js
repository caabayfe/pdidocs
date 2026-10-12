function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, source, function(v) {
		debugger;
        return !v;
    });
}
