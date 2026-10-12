function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');

    function getFillColor() {
        return forcedColorsDarkTheme ? 'ButtonFace' : resolveThemeVariable('--now-color_background--primary');
    }

    function getHighlightedFillColor() {
        return forcedColorsDarkTheme ? 'Highlight' : resolveThemeVariable('--now-color_grouped--yellow-1');
    }

    return new go.Binding(target, source, function(h) {
        return h ? getHighlightedFillColor() : getFillColor();
    }).ofObject();
}
