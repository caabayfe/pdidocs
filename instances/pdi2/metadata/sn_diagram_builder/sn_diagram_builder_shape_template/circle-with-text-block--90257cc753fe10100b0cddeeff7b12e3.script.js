function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    return $(go.Node, "Auto", {
            selectionAdorned: false, // Disable default selection for node
            shadowColor: resolveThemeVariable("--now-datavis_color--teal-4"), // Shadow settings when a node is selected
            shadowBlur: 20,
            shadowOffset: go.Point.parse("0 0")
        },
        new go.Binding("isShadowed", "isSelected", function(v) {
            return v;
        }).ofObject(), // Add shadow only when a node is selected
        $(go.Shape, "Circle", {
            fill: resolveThemeVariable("--now-color--neutral-0"),
            stroke: resolveThemeVariable("--now-color--neutral-2"),
            strokeWidth: 1,
            width: 50,
            height: 50
        }),
        $(go.TextBlock, {
                font: "9pt Lato, Helvetica, Arial, sans-serif",
                stroke: resolveThemeVariable("--now-datavis_color--blue-7")
            },
            new go.Binding("text", "name")
        )
    );
}
