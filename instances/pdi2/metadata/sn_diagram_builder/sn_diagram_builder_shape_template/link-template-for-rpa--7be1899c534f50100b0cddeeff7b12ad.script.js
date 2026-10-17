function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    return $(go.Link, {
            selectionAdorned: false, // Disable default selection	
            routing: go.Link.AvoidsNodes // link route should avoid nodes
        },
        $(go.Shape, // Link line shape
            {
                strokeDashArray: [5, 3],
                strokeWidth: 2,
                stroke: resolveThemeVariable("--now-card--border-color")
            }
        ),
        $(go.Shape, // Link to arrow settings
            {
                toArrow: "Triangle",
                stroke: resolveThemeVariable("--now-card--border-color"),
                fill: resolveThemeVariable("--now-card--border-color")
            }
        ),
        $(go.Panel, "Auto", // Panel to hold add node button
            $(go.Shape, "RoundedRectangle", {
                stroke: resolveThemeVariable("--now-datavis_color--blue-7"),
                width: 20,
                height: 20,
                fill: resolveThemeVariable("--now-color--neutral-0")
            }),
            $("Button", // Add node button
                {
                    margin: 1,
                    click: function(event, data) {
                        dispatch("GO_DIAGRAM#ADD_NODE_CLICKED", event);
                    }
                },
                $(go.TextBlock, {
                    text: '+',
                    font: '13pt Lato, Helvetica, Arial, sans-serif',
                    stroke: resolveThemeVariable('--now-datavis_color--blue-7')
                })
            )
        )
    );
}
