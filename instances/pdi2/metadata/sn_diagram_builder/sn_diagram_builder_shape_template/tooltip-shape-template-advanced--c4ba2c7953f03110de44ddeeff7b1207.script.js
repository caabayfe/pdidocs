function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var jsonProps = shapeTemplateUtilities.jsonProps || {}; // Shape template properties passed from the parent shape template

    return $(go.Adornment,
        $(go.Panel, "Auto", {
            background: jsonProps.background ? jsonProps.background : resolveThemeVariable('--now-color_background--primary-actionable'),
        }, $(go.TextBlock, {
                margin: 7,
                stroke: resolveThemeVariable("--now-color--neutral-0"),
                font: "10px Poppins",
                maxSize: new go.Size(175, NaN)
            },
            new go.Binding("text", "name")))
    );
}
