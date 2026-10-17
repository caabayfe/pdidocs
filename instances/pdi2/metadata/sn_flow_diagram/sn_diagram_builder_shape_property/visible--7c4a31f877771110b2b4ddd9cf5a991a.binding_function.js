function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, source, function(linkLabel, obj) {
        if (!linkLabel) {
            return false;
        }
        return true;
    });
}
