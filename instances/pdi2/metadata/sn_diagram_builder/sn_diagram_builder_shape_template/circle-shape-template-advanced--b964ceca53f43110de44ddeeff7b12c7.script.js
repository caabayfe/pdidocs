function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var jsonProps = shapeTemplateUtilities.jsonProps || {}; // JSON props passed from the parent shape template
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');

    function getFillColor() {
        return forcedColorsDarkTheme ? 'ButtonFace' : resolveThemeVariable('--now-color_background--primary');
    }

    function getHighlightedFillColor() {
        return forcedColorsDarkTheme ? 'Highlight' : resolveThemeVariable('--now-color_grouped--yellow-1');
    }

    return $(go.Shape, "Circle", {
        fill: forcedColorsDarkTheme ? "ButtonFace" : resolveThemeVariable('--now-color--neutral-0'),
        stroke: jsonProps.stroke ? jsonProps.stroke : resolveThemeVariable('--now-color--neutral-2'),
        strokeWidth: jsonProps.strokeWidth ? jsonProps.strokeWidth : 1,
        width: 50,
        height: 50,
        opacity: 1,
    }, new go.Binding("fill", "isHighlighted", function(h) {
        return h ? getHighlightedFillColor() : getFillColor();
    }).ofObject());
}
