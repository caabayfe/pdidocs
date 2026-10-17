function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return $(go.Adornment,
        $(go.Panel, "Auto",
            $(go.Shape, "RoundedRectangle", {
                fill: resolveThemeVariable("--now-color--neutral-19") || "#0B1012",
                stroke: resolveThemeVariable("--now-color--neutral-7") || "#8F95A1",
                parameter1: resolveThemeVariable("--now-actionable--border-radius") || "6px",
            }),
            $(go.TextBlock, {
                    margin: new go.Margin(4, 8),
                    stroke: resolveThemeVariable("--now-color--neutral-0") || "#FFFFFF",
                    font: '12px "Open Sans", sans-serif',
                    maxSize: new go.Size(175, NaN)
                },
                new go.Binding("text", "name")))
    );
}
