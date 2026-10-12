function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var node = $(go.Panel, "Horizontal", {
            shadowVisible: false,
            stretch: go.GraphObject.Horizontal,
        },
        new go.Binding("minSize", "", function(data) {
            if (data.instanceType === "FlowLogicInstanceType") {
                return new go.Size(270, NaN);
            }
            return new go.Size(290, NaN);
        }),
        new go.Binding("desiredSize", "", function(data, panel) {
            var parentPanelWidth = panel.panel.actualBounds.width;
            // set the maximum width to be the width of the parent panel
            // you may need to adjust this based on the layout of your node or part
            return new go.Size(parentPanelWidth, 24);
        }),
        $(go.Panel, "Position", {
                stretch: go.GraphObject.Horizontal,
            },
            new go.Binding("desiredSize", "", function(data, panel) {
                var parentPanelWidth = panel.panel.actualBounds.width;
                // set the maximum width to be the width of the parent panel
                // you may need to adjust this based on the layout of your node or part
                return new go.Size(parentPanelWidth, 24);
            }),
            $(go.Shape, "RoundedRectangle", {
                    fill: resolveThemeVariable("--now-color_background--tertiary") || "#E1E4E6",
                    stroke: null,
                    height: 24,
                    stretch: go.GraphObject.Horizontal
                },
                new go.Binding("minSize", "", function(data) {
                    if (data.instanceType === "FlowLogicInstanceType") {
                        return new go.Size(270, NaN);
                    }
                    return new go.Size(290, NaN);
                })
            ),
            $(go.Panel, "Table", {
                    stretch: go.GraphObject.Fill,
                },
                new go.Binding("desiredSize", "", function(data, panel) {
                    var parentPanelWidth = panel.panel.actualBounds.width;
                    var height = panel.panel.actualBounds.height;
                    // set the maximum width to be the width of the parent panel
                    // you may need to adjust this based on the layout of your node or part
                    return new go.Size(parentPanelWidth, height);
                }),
                $(go.TextBlock, {
                        stretch: go.GraphObject.Horizontal,
                        font: '12px "Open Sans", sans-serif',
                        stroke: resolveThemeVariable("--now-color_text--primary") || "#10171B",
                        textAlign: "left",
                        editable: false,
                        height: 24,
                        overflow: go.TextBlock.OverflowEllipsis,
                        maxLines: 1,
                        row: 0,
                        verticalAlignment: go.Spot.Center,
                        name: "AnnotationTextBlock",
                        isMultiline: false,
                        wrap: go.TextBlock.WrapBreakAll
                    },
                    new go.Binding("margin", "", function(data, panel) {
                        // flow logics are slightly smaller, so we need to address the size
                        if (data.instanceType === "FlowLogicInstanceType") {
                            return new go.Margin(0, 8, 0, 8);
                        }
                        return new go.Margin(0, 8, 0, 8);
                    }),
                    new go.Binding("text", "comment").makeTwoWay()
                ), {
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
                                },
                                new go.Binding("maxSize", "", function(data) {
                                    if (data.instanceType === "FlowLogicInstanceType") {
                                        return new go.Size(100, NaN);
                                    }
                                    return new go.Size(175, NaN);
                                }),
                                new go.Binding("text", "", function(graphObject) {
                                    if (graphObject.comment) {
                                        return graphObject.comment;
                                    }
                                    return "";
                                })
                            )
                        )
                    )
                }
            )
        )
    );

    return node;
}
