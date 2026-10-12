function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(isDarkTheme) {
        return isDarkTheme ? '/ellipsis-v-outline-white.svg' : '/ellipsis-v-outline.svg';
    }).ofModel();
}
