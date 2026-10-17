function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(isDarkTheme) {
        return isDarkTheme ? '/arrow-counterclockwise-fill-white.svg' : '/arrow-counterclockwise-fill.svg';
    }).ofModel();
}
