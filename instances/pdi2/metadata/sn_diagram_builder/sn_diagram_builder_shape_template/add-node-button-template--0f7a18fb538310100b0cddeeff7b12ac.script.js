function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');
    return $(go.TextBlock, {
        name: "addNodeButton",
        text: '+',
        font: '15pt Lato, Helvetica, Arial, sans-serif',
        stroke: forcedColorsDarkTheme ? 'ButtonText' : resolveThemeVariable('--now-color_grouped--teal-2'),
        click: function(event, buttonObject) {
            dispatch("GO_DIAGRAM#ADD_NODE_CLICKED", event);
        },
        cursor: "pointer"
    });
}
