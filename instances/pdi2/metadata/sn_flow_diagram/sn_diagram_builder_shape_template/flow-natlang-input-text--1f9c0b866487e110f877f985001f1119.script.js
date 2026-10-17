function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var node = $(go.Panel, "Auto", {
            background: resolveThemeVariable("--now-color_background--primary") || "#FFFFFF",
            shadowVisible: false,
        },
        $(
            go.TextBlock, {
                margin: new go.Margin(0, 0, 0, 0),
                font: '12px "Open Sans", sans-serif',
                textAlign: "left",
                shadowVisible: false,
                overflow: go.TextBlock.OverflowEllipsis,
                width: 270,
                maxSize: new go.Size(275, 35),
                maxLines: 2,
                stroke: resolveThemeVariable("--now-color_text--primary") || "#10171B"
            },
            new go.Binding("text", "", function(graphObject) {
                if (graphObject.data && graphObject.data.conditionDisplay) {
                    return graphObject.data.conditionDisplay;
                }
                return "";
            })
        ), {
            // Tooltips are exempt from semantic variables because
            // they don't change colors between themes
            toolTip: $(go.Adornment, "Auto",
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
                        new go.Binding("text", "", function(graphObject) {
                            if (graphObject.data && graphObject.data.fullConditionDisplay) {
                                return graphObject.data.fullConditionDisplay;
                            }
                            return "";
                        })
                    )
                )
            )
        }
    );


    return node;
}
