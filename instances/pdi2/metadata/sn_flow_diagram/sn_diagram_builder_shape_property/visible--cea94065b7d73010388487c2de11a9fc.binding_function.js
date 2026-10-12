function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, source, function(linkLabel) {
        if (linkLabel)
            return true;
        return false;
    });
}
