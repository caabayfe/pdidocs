function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, "size", go.Size.parse).makeTwoWay(go.Size.stringify);
}
