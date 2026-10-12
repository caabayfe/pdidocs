function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, source, function(_isPaletteNode) {
        return !_isPaletteNode;
    }).ofModel();
}
