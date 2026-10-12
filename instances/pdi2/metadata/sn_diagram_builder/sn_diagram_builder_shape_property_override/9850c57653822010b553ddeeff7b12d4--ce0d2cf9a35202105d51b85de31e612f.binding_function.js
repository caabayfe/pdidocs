function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(isDarkTheme) {
        return isDarkTheme ? '/action-node-white.svg' : '/action-node.svg';
    }).ofModel();
}
