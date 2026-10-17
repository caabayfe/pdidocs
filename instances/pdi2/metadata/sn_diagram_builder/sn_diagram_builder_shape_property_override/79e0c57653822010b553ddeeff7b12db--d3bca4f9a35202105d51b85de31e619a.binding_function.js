function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(isDarkTheme) {
        return isDarkTheme ? '/separate-fill-white.svg' : '/separate-fill.svg';
    }).ofModel();
}
