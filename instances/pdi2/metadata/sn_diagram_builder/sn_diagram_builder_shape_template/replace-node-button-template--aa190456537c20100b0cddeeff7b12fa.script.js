function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    return $(go.TextBlock, {
            text: '+',
            font: '15pt Lato, Helvetica, Arial, sans-serif',
            stroke: resolveThemeVariable('--now-datavis_color--blue-7'),
            cursor: "pointer"
        },
        new go.Binding("click", "", function(node) {
            return function(event, buttonObject) {
                dispatch("GO_DIAGRAM#REPLACE_NODE_CLICKED", {
                    key: node.data.key,
                    group: node.data.group
                });
            };
        }).ofObject());
}
