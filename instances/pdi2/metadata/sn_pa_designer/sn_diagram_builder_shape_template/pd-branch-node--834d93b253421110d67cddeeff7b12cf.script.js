function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorWhite = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL1);
    var colorGray = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL6);

	// the shared method among shape templates
    var isEditMode = go.go.PadCustomizationShared.isEditMode;

    // the height of the current PD Automation Step Node: 64 + 88
    var NODE_HEIGHT = 152;
    var ADD_BUTTON_SIZE = 16;

    // for v1 the branch node is only used by the parallel link
    // therefore the port should be disabled
    // and will be added back once the decision node is enabled.
    // function showPort(node, show) {
    //     var portRight = node.findObject("PORT_RIGHT");
    //     portRight.fill = show ? colorWhite : null;
    //     portRight.stroke = show ? colorPrimary1 : null;
    // }

    function isProcessNode(data) {
        return data.key === 'process-virtual-start';
    }

    function isLane(data) {
        return data.isGroup || isProcessNode(data);
    }

    return $(go.Node,
        new go.Binding("opacity", "", function(data, model) {
            return data.isHidden ? 0.0 : 1.0;
        }), {
            layerName: "Foreground",
            selectionAdorned: false,
            // for v1, no port in branch node
            // mouseEnter: function(e, node) {
            //     showPort(node, true);
            // },
            // mouseHover: function(e, node) {
            //     showPort(node, true);
            // },
            // mouseLeave: function(e, node) {
            //     showPort(node, false);
            // }
        },
        $(
            go.Panel,
            "Position", {
                desiredSize: new go.Size(ADD_BUTTON_SIZE + 2, NODE_HEIGHT),
            },
            $(go.Shape, "Rectangle", {
                fill: "transparent",
                stroke: null
            }),
            $(
                "Button",
				new go.Binding('visible', '', function (data, btn) {
					return !isEditMode(btn) ? false : true;
				}),
				new go.Binding('cursor', '', function (data, btn) {
					return !isEditMode(btn) ? 'default' : 'pointer';
				}),
				{
                    position: new go.Point(0, (NODE_HEIGHT - ADD_BUTTON_SIZE) / 2),
                    // set properties on the border Shape of the "Button"
                    "ButtonBorder.figure": "Circle",
                    "ButtonBorder.fill": colorWhite,
                    "ButtonBorder.stroke": colorGray,
                    "ButtonBorder.strokeWidth": 1,
                    "ButtonBorder.width": ADD_BUTTON_SIZE,
                    "ButtonBorder.height": ADD_BUTTON_SIZE,
                    // set properties on the "Button" itself used by its event handlers
                    _buttonFillOver: colorPrimary1,
                    _buttonStrokeOver: colorPrimary1,
                    _buttonFillPressed: colorPrimary1,
                    _buttonStrokePressed: colorPrimary1,
                    mouseEnter: function(e, btn) {
						if (!isEditMode(btn)) return;
                        if (!btn.isEnabledObject()) return;

                        var shape = btn.findObject("ButtonBorder"); // the border Shape
                        if (shape instanceof go.Shape) {
                            var brush = btn["_buttonFillOver"];
                            btn["_buttonFillNormal"] = shape.fill;
                            shape.fill = brush;
                            brush = btn["_buttonStrokeOver"];
                            btn["_buttonStrokeNormal"] = shape.stroke;
                            shape.stroke = brush;
                        }

                        var plus = btn.findObject("ButtonText");
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

                        var plus = btn.findObject("ButtonText");
                        if (plus) {
                            plus.stroke = colorGray;
                        }
                    },
                    click: function(e, btn) {
						if (!isEditMode(btn)) return;

                        var currNode = btn.part;
                        // for parallel edge, there is only one edge goes into this branch node
                        var incomingEdge = currNode.findLinksInto().first();
                        if (!incomingEdge) return;
                        var fromData = incomingEdge.fromNode.data;

                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: currNode.data,
                            nodeContext: {
                                addType: currNode.data.nodeContext,
                                nodeType: isLane(fromData) ? 'lane' : 'activity'
                            }
                        });
                    }
                },
                $(go.TextBlock, {
                    name: "ButtonText",
                    text: "+",
                    stroke: colorGray,
                })
            ),
            $(go.Shape, "Rectangle", {
                fill: null,
                stroke: null,
                desiredSize: new go.Size(0, 0),
                position: new go.Point(0, NODE_HEIGHT / 2),
                portId: "c0bed67c535c20100b0cddeeff7b12fc",
                fromSpot: go.Spot.Left,
                toSpot: go.Spot.Left,
                fromLinkable: false,
                toLinkable: false,
                cursor: "pointer",
            }),
            $(go.Shape,
                new go.Binding("visible", "isParallel", function(isParallel) {
                    return !isParallel;
                }),
                "Circle", {
                    name: "PORT_RIGHT",
                    fill: null,
                    stroke: null,
                    desiredSize: new go.Size(0, 0),
                    position: new go.Point(ADD_BUTTON_SIZE, NODE_HEIGHT / 2),
                    portId: "49de92bc535c20100b0cddeeff7b12f9",
                    fromSpot: go.Spot.Right,
                    toSpot: go.Spot.Right,
                    fromLinkable: true,
                    toLinkable: false,
                    cursor: "pointer",
                })
        ));
}
