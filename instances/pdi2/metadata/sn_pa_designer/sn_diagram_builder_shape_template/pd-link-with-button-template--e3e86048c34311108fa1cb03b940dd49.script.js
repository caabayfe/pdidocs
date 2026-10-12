function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // Edges have the same styling as PD Link Template
    var colorWhite = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL1);
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var linkColorPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL7);
    var colorGray = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL6);
    var colorBorderPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_PRIMARY);
    var colorBorderTertiary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_TERTIARY);
    var END_SEGMENT_LENGTH = 40;
    var LINK_HIGHLIGHT = "LinkHighlight";

    var isEditMode = go.go.PadCustomizationShared.isEditMode;

    function makeButton(name, label, alignment, alignmentFocus, clickHandler) {
        return $(
            "Button",
            new go.Binding("visible", '', function(data, btn) {
                return !isEditMode(btn) ? false : true;
            }),
            new go.Binding("cursor", '', function(data, btn) {
                return !isEditMode(btn) ? "default" : "pointer";
            }), {
                alignment: alignment,
                alignmentFocus: alignmentFocus,
                name: name,
                "ButtonBorder.figure": "Circle",
                "ButtonBorder.fill": colorPrimary1,
                "ButtonBorder.stroke": colorPrimary1,
                "ButtonBorder.strokeWidth": 1,
                "ButtonBorder.width": 16,
                "ButtonBorder.height": 16,
                // set properties on the "Button" itself used by its event handlers
                _buttonFillOver: colorPrimary1,
                _buttonStrokeOver: colorPrimary1,
                _buttonFillPressed: colorPrimary1,
                _buttonStrokePressed: colorPrimary1,
                click: clickHandler,
                mouseEnter: function(e, btn) {
                    if (!btn.isEnabledObject()) return;

                    if (!isEditMode(btn)) return;

                    var shape = btn.findObject("ButtonBorder"); // the border Shape
                    if (shape instanceof go.Shape) {
                        var brush = btn["_buttonFillOver"];
                        btn["_buttonFillNormal"] = shape.fill;
                        shape.fill = brush;
                        brush = btn["_buttonStrokeOver"];
                        btn["_buttonStrokeNormal"] = shape.stroke;
                        shape.stroke = brush;
                    }

                    var plus = btn.part.findObject(name + "btn");
                    if (plus) {
                        plus.stroke = colorWhite;
                    }
                },
                mouseLeave: function(e, btn) {
                    if (!btn.isEnabledObject()) return;

                    var shape = btn.findObject("ButtonBorder"); // the border Shape
                    if (shape instanceof go.Shape) {
                        shape.fill = btn["_buttonFillNormal"];
                        shape.stroke = btn["_buttonStrokeNormal"];
                    }

                    var plus = btn.part.findObject(name + "btn");
                    if (plus) {
                        plus.stroke = colorWhite;
                    }
                },
            },
            $(go.TextBlock, {
                name: name + "btn",
                text: label,
                stroke: colorWhite
            })
        );
    }

    return $(
        go.Link,
        go.Link.Orthogonal, {
            selectable: false,
            corner: 16,
            toShortLength: 8,
            fromEndSegmentLength: END_SEGMENT_LENGTH,
            toEndSegmentLength: END_SEGMENT_LENGTH,
            mouseEnter: function(e, link) {
                if (!isEditMode(link)) return;

                link.findObject(LINK_HIGHLIGHT).stroke = colorBorderTertiary;
            },
            mouseLeave: function(e, link) {
                link.findObject(LINK_HIGHLIGHT).stroke = "transparent";
            }
        },
        $(go.Shape, {
            isPanelMain: true,
            name: LINK_HIGHLIGHT,
            strokeWidth: 12,
            stroke: "transparent"
        }),
        $(go.Shape, {
            isPanelMain: true,
            strokeWidth: 2,
            stroke: linkColorPrimary
        }),
        $(go.Shape, {
            toArrow: "Triangle",
            fill: colorBorderPrimary,
            stroke: null
        }),
        makeButton("ADD_BUTTON_RIGHT", "+", new go.Spot(0, 0, 0, 0), new go.Spot(0.4, 0.5, 0, 0), function(event, btn) {
            if (!isEditMode(btn)) return;

            dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                type: "picker",
                position: btn.getDocumentPoint(go.Spot.Center),
                nodeData: {
                    key: btn.part.data.from
                },
                nodeContext: {
                    addType: 'addRight',
                    nodeType: 'lane'
                }
            });
        })
    );
}
