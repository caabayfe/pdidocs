function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(_isPaletteNode) {
        return _isPaletteNode ?
            resolveThemeVariable('--now-card--border-color') :
            resolveThemeVariable('--now-color_grouped--teal-2');
    }).ofModel();
}
