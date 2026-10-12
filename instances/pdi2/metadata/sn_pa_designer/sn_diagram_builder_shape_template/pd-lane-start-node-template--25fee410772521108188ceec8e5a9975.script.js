function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // the shared method among shape templates
    var makeAddButton = go.go.PadCustomizationShared.makeAddButton;
    var isEditMode = go.go.PadCustomizationShared.isEditMode;

    var ADD_BUTTON_SIZE = 16;
    var PORT_SIZE = 12;
    var PORT_DOT_DIAMETER = 4;
    var START_SHAPE_PORT_X_PADDING = 10;
    var START_SHAPE_PORT_Y_PADDING = 2.5;
    var START_SHAPE_WIDTH = 15;
    var START_SHAPE_HEIGHT = 16;
    var BOUNDING_BOX_WIDTH = 44;
    var BOUNDING_BOX_HEIGHT = 18;
    var PORT_ADD_BUTTON_GAP = 6;

    var colorPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorWhite = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL1);
    var coloNeutral8 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL8);
    var colorBorderSecondary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_SECONDARY);
    var colorSurfaceBrand1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BRAND1);
    var colorAlertHigh2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH2);

    var OUTER_PORT_CIRCLE = 'OUTER_PORT_CIRCLE';
    var INNER_PORT_CIRCLE = 'INNER_PORT_CIRCLE';
    var VIRTUAL_START_DRAG_HANDLE = 'VIRTUAL_START_DRAG_HANDLE';

    function drawLink(e, obj) {
        var node = obj.part;
        var tool = e.diagram.toolManager.linkingTool;
        var port = node.findObject("PORT_DRAW");
        tool.startObject = port;
        tool.temporaryToNode.location = e.diagram.lastInput.documentPoint;
        e.diagram.currentTool = tool;
        tool.doActivate();
        tool.temporaryFromNode.ensureBounds();
        tool.temporaryToNode.ensureBounds();
        tool.temporaryFromPort = $(go.Shape, 'Circle', {
            width: PORT_SIZE,
            height: PORT_SIZE,
            fill: colorPrimary,
            stroke: colorPrimary,
            segmentIndex: 0,
        });
    }

    function handleMouseEnterAndHover(e, node, metaData) {
        if (!isEditMode(e)) return;

        var nodeHoverAdornment = formNodeHoverAdornment();
        dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
            node: node,
            diagram: e.diagram,
            adornment: nodeHoverAdornment,
            highlight: true,
            metaData: metaData
        });
    }

    function leaveNode(node, next) {
        // two cases of the adornment as next.part, which indicates that the mouse does not leave the current node
        if (next?.part instanceof go.Adornment) {
            // 1. the adornment is part of the current node (the add button)
            if (next.part.adornedObject === node) {
                return false;
            }
            // 2. the adornment is part of the selected link to or from the current node
            if (next.part.adornedObject.part instanceof go.Link) {
                var link = next.part.adornedObject.part;
                if (link.isSelected && (link.fromNode?.data?.key === node.data.key || link.toNode?.data?.key === node.data.key)) {
                    return false;
                }
            }
        }
        return true;
    }

    function handleMouseLeave(e, node, next) {
        if (leaveNode(node, next)) {
            dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                node: node,
                diagram: e.diagram,
                highlight: false
            });
        }
    }

    function formNodeHoverAdornment() {
        return $(
            go.Adornment,
            "Spot", $(
                go.Panel,
                "Auto",
                $(go.Shape, {
                    fill: null,
                    stroke: null
                }),
                $(go.Placeholder, {})
            ),
            makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: "ADD_BUTTON_RIGHT",
                    label: "+",
                    alignment: new go.Spot(0, 0, START_SHAPE_WIDTH + PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP + 2, ADD_BUTTON_SIZE / 2 + 2),
                    alignmentFocus: go.Spot.Left,
                    mode: "standard",
                    clickHandler: function(e, btn) {
                        if (!isEditMode(btn)) return;

                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: btn.part.data,
                            nodeContext: 'addRight',
                        });
                    }
                }
            )
        );
    }

    function makePort(portId, name, spot, alignment, alignmentFocus, output, input) {
        return $(go.Shape, "Circle", {
            name: name,
            fill: null,
            stroke: null,
            desiredSize: new go.Size(0, 0),
            alignment: alignment,
            alignmentFocus: alignmentFocus,
            portId: portId,
            fromSpot: spot,
            toSpot: spot,
            fromLinkable: output,
            toLinkable: input,
            cursor: "pointer",
        });
    }

    return $(
        go.Node,
        "Spot", {
            selectionAdorned: false,
            layerName: "Foreground",
            mouseEnter: handleMouseEnterAndHover,
            mouseHover: handleMouseEnterAndHover,
            mouseLeave: handleMouseLeave,
        },
        $(
            go.Panel,
            "Position",
            new go.Binding("opacity", "hasOutgoing", function(hasOutgoing) {
                return hasOutgoing ? 0 : 1;
            }), {
                name: VIRTUAL_START_DRAG_HANDLE
            },
            $(go.Shape, "Rectangle", {
                name: VIRTUAL_START_DRAG_HANDLE,
                width: BOUNDING_BOX_WIDTH,
                height: BOUNDING_BOX_HEIGHT,
                fill: "transparent",
                stroke: null,
            }),
            $(go.Shape, "RoundedHalfSemiCircle", {
                name: "virtualStartShape",
                angle: 90,
                width: START_SHAPE_WIDTH,
                height: START_SHAPE_HEIGHT,
                fill: coloNeutral8,
                stroke: coloNeutral8,
                margin: new go.Margin(1, 0, 0, 1)
            }),
            $(
                go.Panel,
                "Table",
                new go.Binding("mouseLeave", "", function(data) {
                    return function(e, obj) {
                        dispatch("PAD#DIAGRAM_HIDE_TOOLTIP");

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        outerPortCircle.fill = colorWhite;

                        if (data.hasOutgoing) {
                            outerPortCircle.stroke = colorBorderSecondary;
                            innerPortCircle.fill = colorPrimary;
                        } else {
                            outerPortCircle.stroke = colorAlertHigh2;
                            innerPortCircle.fill = colorAlertHigh2;
                        }
                    };
                }), {
                    name: "virtualStartPort",
                    position: new go.Point(START_SHAPE_PORT_X_PADDING, START_SHAPE_PORT_Y_PADDING),
                    cursor: "pointer",
                    isActionable: true,
                    actionMove: drawLink,
                    mouseHover: function(e) {
                        if (!isEditMode(e)) return;

                        var eventClientX = e.event.clientX;
                        var eventClientY = e.event.clientY;
                        var tooltipLocation = {
                            x: eventClientX,
                            y: eventClientY,
                        };
                        dispatch("PAD#DIAGRAM_SHOW_TOOLTIP", {
                            type: "node_connector",
                            location: tooltipLocation,
                        });
                    },
                    mouseEnter: function(e, obj) {
                        if (!isEditMode(e)) return;

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        outerPortCircle.stroke = colorPrimary;
                        outerPortCircle.fill = colorSurfaceBrand1;
                        innerPortCircle.fill = colorPrimary;
                    },
                    mouseLeave: function(e, obj) {
                        dispatch("PAD#DIAGRAM_HIDE_TOOLTIP");
                    },
                },
                $(go.Shape, "Circle",
                    new go.Binding("stroke", "hasOutgoing", function(hasOutgoing) {
                        return hasOutgoing ? colorBorderSecondary : colorAlertHigh2;
                    }), {
                        name: OUTER_PORT_CIRCLE,
                        fill: colorWhite,
                        strokeWidth: 1,
                        desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
                    }),
                $(go.Shape, "Circle",
                    new go.Binding("fill", "hasOutgoing", function(hasOutgoing) {
                        return hasOutgoing ? colorPrimary : colorAlertHigh2;
                    }), {
                        name: INNER_PORT_CIRCLE,
                        strokeWidth: 0,
                        desiredSize: new go.Size(PORT_DOT_DIAMETER, PORT_DOT_DIAMETER),
                    })
            )
        ),
        makePort(
            "49de92bc535c20100b0cddeeff7b12f9",
            "PORT_RIGHT",
            go.Spot.Right,
            new go.Spot(1, 0.5),
            new go.Spot(0.5, 1, BOUNDING_BOX_WIDTH + 1.5, 0),
            true,
            false
        ),
        makePort(
            "PORT_DRAW",
            "PORT_DRAW",
            go.Spot.Right,
            new go.Spot(0, 0.5),
            new go.Spot(0, 0, -START_SHAPE_WIDTH - 1, 0.5),
            true,
            false
        )
    );
}
