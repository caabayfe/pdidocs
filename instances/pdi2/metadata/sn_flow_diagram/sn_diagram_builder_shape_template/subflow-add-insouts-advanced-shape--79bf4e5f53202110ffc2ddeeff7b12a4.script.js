function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var nowColorPrimary1 = resolveThemeVariable("--now-color--primary-1") || "#4C6CEB";
    var nowColorPrimary2 = resolveThemeVariable("--now-color--primary-2") || "#3449A0";
    var nowColorPrimary3 = resolveThemeVariable("--now-color--primary-3") || "#1B2652";
    var nowColorText = resolveThemeVariable("--now-color_text--primary-actionable") || "#FFFFFF";
    var nowOpacityLess = resolveThemeVariable("--now-opacity--less") || "0.25";
    // Shared between button and shape underneath so
    // that when the button is set to have less opacity,
    // the button will not be see through
    var sharedProps = {
        figure: "RoundedRectangle",
        width: 264,
        height: 32,
        strokeWidth: 0,
        parameter1: 6
    };

    return (
        $(go.Panel, "Spot",
            $("Shape", {
                ...sharedProps,
                fill: nowColorText,
                stroke: nowColorText,
            }),
            $("Button",
                new go.Binding("isEnabled", "_isReadOnly", function(isReadOnly) {
                    return !isReadOnly;
                }).ofModel(),
                new go.Binding("ButtonBorder.opacity", "_isReadOnly", function(isReadOnly) {
                    return isReadOnly ? nowOpacityLess : 1;
                }).ofModel(), {
                    // set properties on the border Shape of the "Button"
                    "ButtonBorder.figure": sharedProps.figure,
                    "ButtonBorder.fill": nowColorPrimary1,
                    "ButtonBorder.stroke": nowColorPrimary1,
                    "ButtonBorder.strokeWidth": sharedProps.strokeWidth,
                    "ButtonBorder.width": sharedProps.width,
                    "ButtonBorder.height": sharedProps.height,
                    // parameter1 is similar (but not exact) to the border radius
                    "ButtonBorder.parameter1": sharedProps.paramater1,
                    // set properties on the "Button" itself used by its event handlers
                    "_buttonFillOver": nowColorPrimary2,
                    "_buttonStrokeOver": nowColorPrimary2,
                    "_buttonFillPressed": nowColorPrimary3,
                    "_buttonStrokePressed": nowColorPrimary3,
                    "_buttonFillDisabled": nowColorPrimary1,
                    "_buttonFillNormal": nowColorPrimary1,
                    click: function(event, btn) {
                        dispatch("GO_DIAGRAM#NODE_SELECTED", {
                            event: event,
                            buttonPosition: btn.getDocumentPoint(go.Spot.Center),
                            instanceType: 'SubflowInputsOutputsType'
                        });
                    },
                    mouseEnter: function(e, btn) {
                        if (!btn.isEnabledObject()) return;
                        var shape = btn.findObject('ButtonBorder'); // the border Shape
                        if (shape instanceof go.Shape) {
                            var brush = btn['_buttonFillOver'];
                            btn['_buttonFillNormal'] = shape.fill;
                            shape.fill = brush;
                            brush = btn['_buttonStrokeOver'];
                            shape.stroke = brush;
                        }
                    },
                    mouseLeave: function(e, btn) {
                        if (!btn.isEnabledObject()) return;
                        var shape = btn.findObject('ButtonBorder'); // the border Shape
                        if (shape instanceof go.Shape) {
                            shape.fill = btn['_buttonFillNormal'];
                            shape.stroke = btn['_buttonStrokeNormal'];
                        }
                        var plus = btn.part.findObject('addBtnPlus');
                        if (plus) {
                            plus.stroke = btn['_buttonStrokeNormal'];
                        }
                    }
                },
                $(go.Panel, "Horizontal",
                    $(go.Picture, {
                        source: "images/circle-plus-md-white.svg",
                        height: 16,
                        width: 16,
                        margin: new go.Margin(0, 8, 0, 0)
                    }),
                    $(go.TextBlock,
                        new go.Binding("text", "labelText"), {
                            stroke: nowColorText,
                            font: "16px 'Open Sans', sans-serif",
                            verticalAlignment: go.Spot.Center,
                            margin: new go.Margin(2, 0, 0, 0),
                            opacity: 1
                        })
                )
            )
        )
    );
}
