function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var colorPrimary = resolveThemeVariable('--now-color--primary-1', false); // Syntax to retrieve the rgb value associated with the specified color theme variable. By default, returns hex value;
    var colorWhite = resolveThemeVariable('--now-color--neutral-0', false); // Syntax to retrieve the rgb value associated with the specified color theme variable. By default, returns hex value;
    var colorGray = resolveThemeVariable('--now-color--neutral-2', false) // Syntax to retrieve the rgb value associated with the specified color theme variable. By default, returns hex value;;

    return (
        $("Button", 
			new go.Binding("visible", "", function(graphObject) {
				return !graphObject.data.addBtnText;
			}).ofObject(), {
                // set properties on the border Shape of the "Button"
                "ButtonBorder.figure": "Circle",
                "ButtonBorder.fill": colorWhite,
                "ButtonBorder.stroke": colorGray,
                "ButtonBorder.strokeWidth": 1,
                "ButtonBorder.width": 15,
                "ButtonBorder.height": 15,
                // set properties on the "Button" itself used by its event handlers
                "_buttonFillOver": colorPrimary,
                "_buttonStrokeOver": colorPrimary,
                "_buttonFillPressed": colorPrimary,
                "_buttonStrokePressed": colorPrimary,
                "name": "linkAddButton",
                "cursor": "pointer",
                mouseEnter: function(e, btn) {
                    if (!btn.isEnabledObject()) return;
                    var shape = btn.findObject('ButtonBorder'); // the border Shape
                    if (shape instanceof go.Shape) {
                        var brush = btn['_buttonFillOver'];
                        btn['_buttonFillNormal'] = shape.fill;
                        shape.fill = brush;
                        brush = btn['_buttonStrokeOver'];
                        btn['_buttonStrokeNormal'] = shape.stroke;
                        shape.stroke = brush;
                    }

                    var plus = btn.part.findObject('addBtnPlus');
                    if (plus) {
                        plus.stroke = colorWhite;
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
                        plus.stroke = colorGray;
                    }
                },
                click: function(event, btn) {
                    var link = btn.part.findObject('linkMain');
                    if (link) {
                        btn.diagram.select(link);
                    }

                    dispatch("FLOW_DIAGRAM#ADD_NODE_CLICKED", {
                        event: event,
                        buttonPosition: btn.getDocumentPoint(go.Spot.Center)
                    });
                }
            },
            $(go.TextBlock, {
                name: "addBtnPlus",
                text: "+",
                stroke: colorGray,
            })
        )
    );
}
