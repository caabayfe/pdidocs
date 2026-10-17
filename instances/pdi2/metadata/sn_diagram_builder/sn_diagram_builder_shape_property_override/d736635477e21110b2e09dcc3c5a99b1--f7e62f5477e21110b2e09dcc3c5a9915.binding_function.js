function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(isDarkTheme) {
        return isDarkTheme ? '/switch-node-white.svg' : '/switch-node.svg';
    }).ofModel();
}
