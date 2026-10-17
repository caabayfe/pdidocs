function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // the shared method among shape templates
    var makeAddButton = go.go.PadCustomizationShared.makeAddButton;
    var isEditMode = go.go.PadCustomizationShared.isEditMode;
    var isPreviewMode = go.go.PadCustomizationShared.isPreviewMode;

    var BOUNDING_BOX_EXTRA_WIDTH = 72;
    var NODE_SIZE = 115;
    var NODE_HEIGHT = 152;
    var PORT_SIZE = 12;
    var PORT_DOT_DIAMETER = 4;
    var ADD_BUTTON_SIZE = 16;
    var PORT_ADD_BUTTON_GAP = 8;

    var COLOR_NEUTRAL_19 = go.go.PadCustomizationShared.COLORS.NEUTRAL19;
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY2);
    var colorPrimaryText = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.TEXT_PRIMARY);
    var colorNeutral19 = resolveThemeVariable(COLOR_NEUTRAL_19);
    var colorNeutral0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL0);
    var colorSurfaceBrand1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BRAND1);
    var colorBorderSecondary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_SECONDARY);
    var nodeShadowColor = "rgba(" + resolveThemeVariable(COLOR_NEUTRAL_19, false) + ", 0.2)";
    var OUTER_PORT_CIRCLE = 'OUTER_PORT_CIRCLE';
    var INNER_PORT_CIRCLE = 'INNER_PORT_CIRCLE';
    var MAIN_NODE_SHAPE = 'MAIN_NODE_SHAPE';

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

    function makeToolTip(args) {
        if (!args.textSource) {
            return;
        }

        return $(
            go.Adornment,
            "Spot",
            new go.Binding("visible", "", function(obj) {
                // If we're not checking if a textblock is truncated, then
                // the tooltip is always visible
                if (!args.textBlockName) {
                    return true;
                }

                // This tooltip is only visible if the TextBlock metrics show that
                // the display text ends with ellipsis
                var nameTextBlock =
                    obj &&
                    obj.adornedPart &&
                    obj.adornedPart.findObject(args.textBlockName);
                var textLines = nameTextBlock.metrics.arrText;
                var lastLine = textLines[textLines.length - 1];
                return lastLine.endsWith("...");
            }).ofObject(),
            $(
                go.Panel,
                "Auto",
                $(go.Shape, {
                    name: "toolTipBackground",
                    figure: "RoundedRectangle",
                    // paramter1 is border-radius
                    parameter1: 4,
                    fill: colorNeutral19,
                    stroke: colorNeutral19,
                }),
                $(go.TextBlock, new go.Binding("text", args.textSource, function(sourceValue) {
                    return args.objSourceAttribute ?
                        sourceValue[args.objSourceAttribute] :
                        sourceValue;
                }), {
                    stroke: colorNeutral0,
                    maxSize: new go.Size(320, NaN),
                    margin: new go.Margin(4, 8, 4, 8),
                })
            )
        );
    }

    function drawLink(e, obj) {
        var node = obj.part.adornedPart;
        var tool = e.diagram.toolManager.linkingTool;
        var port = node.findObject("PORT_RIGHT");
        tool.startObject = port;
        tool.temporaryToNode.location = e.diagram.lastInput.documentPoint;
        e.diagram.currentTool = tool;
        tool.doActivate();
        tool.temporaryFromNode.ensureBounds();
        tool.temporaryToNode.ensureBounds();
        tool.temporaryFromPort = $(go.Shape, 'Circle', {
            width: PORT_SIZE,
            height: PORT_SIZE,
            fill: colorPrimary1,
            stroke: colorPrimary1,
            segmentIndex: 0,
        });
    }

    function renderPort(showPort, portAlignment) {
        if (showPort) {
            return $(
                go.Panel,
                "Table",
                new go.Binding("mouseEnter", "", function(adornment) {
                    return function(e, obj) {
                        if (!isEditMode(e)) return;

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        if (adornment.adornedPart.isSelected) {
                            outerPortCircle.stroke = colorPrimary2;
                            innerPortCircle.fill = colorPrimary2;
                        } else {
                            outerPortCircle.stroke = colorPrimary1;
                            innerPortCircle.fill = colorPrimary1;
                        }
                        outerPortCircle.fill = colorSurfaceBrand1;
                    };
                }).ofObject(), {
                    alignment: portAlignment,
                    alignmentFocus: go.Spot.Left,
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
                        outerPortCircle.stroke = colorPrimary1;
                        outerPortCircle.fill = colorSurfaceBrand1;
                        innerPortCircle.fill = colorPrimary1;
                    },
                    mouseLeave: function() {
                        dispatch("PAD#DIAGRAM_HIDE_TOOLTIP");
                    },
                },
                $(
                    go.Shape,
                    "Circle",
                    new go.Binding("stroke", "", function(part) {
                        if (part.adornedPart.isSelected && isEditMode(part)) {
                            return colorPrimary1;
                        } else {
                            return colorBorderSecondary;
                        }

                    }).ofObject(),
                    new go.Binding("strokeWidth", "", function(part) {
                        return part.adornedPart.isSelected && isEditMode(part)?
                            2 :
                            1;
                    }).ofObject(), {
                        name: OUTER_PORT_CIRCLE,
                        stretch: go.GraphObject.Fill,
                        fill: colorNeutral0,
                        desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
                    }
                ),
                $(
                    go.Shape,
                    "Circle", {
                        name: INNER_PORT_CIRCLE,
                        strokeWidth: 0,
                        fill: colorPrimary1,
                        desiredSize: new go.Size(
                            PORT_DOT_DIAMETER,
                            PORT_DOT_DIAMETER
                        ),
                    }
                )
            );
        } else {
            return {};
        }
    }

    function formNodeHoverAdornment(showPort, node) {
        var nodeBounds = node.actualBounds;
        var rightPortHorizontalOffset = nodeBounds.width - BOUNDING_BOX_EXTRA_WIDTH / 2;
        var portAlignment = new go.Spot(0, 0, rightPortHorizontalOffset, NODE_HEIGHT / 2);
        var rightButtonHorizontalOffset = rightPortHorizontalOffset + PORT_SIZE + PORT_ADD_BUTTON_GAP;
        return $(
            go.Adornment,
            "Spot",
            $(
                go.Panel,
                "Table",
                $(go.Shape, {
                    fill: null,
                    stroke: null
                }),
                $(go.Placeholder, {})
            ),
            renderPort(showPort, portAlignment),
            makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: "ADD_BUTTON_RIGHT",
                    label: "+",
                    alignment: new go.Spot(0, 0, rightButtonHorizontalOffset, NODE_HEIGHT / 2),
                    alignmentFocus: go.Spot.Left,
                    mode: "standard",
                    clickHandler: function(event, btn) {
                        if (!isEditMode(btn)) return;

                        var currNode = btn.part;
                        // for parallel edge, there is only one edge goes into this branch node
                        // var incomingEdge = currNode.findLinksInto().first();
                        // if (!incomingEdge) return;
                        // var fromData = incomingEdge.fromNode.data;
                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: currNode.data,
                            nodeContext: {
                                addType: currNode.data.nodeContext,
                                nodeType: 'activity'
                            }
                        });
                    }
                }
            )
        );
    }

    function showAdornmentWithPort(node) {
        if (node) {
            var linksOutOf = node.findLinksOutOf();
            if (linksOutOf) {
                return !linksOutOf.any(function(link) {
                    return link.isSelected;
                });
            }
        }
        return true;
    }

    function handleMouseEnterAndHover(e, node) {
        if (!isEditMode(e)) return;

        var nodeHoverAdornment = formNodeHoverAdornment(showAdornmentWithPort(node), node);
        dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
            node: node,
            diagram: e.diagram,
            adornment: nodeHoverAdornment,
            highlight: true
        });
    }

    function leaveNode(node, next) {
        // two cases of the adornment as next.part, which indicates that the mouse does not leave the current node
        if (next.part instanceof go.Adornment) {
            // 1. the adornment is part of the current node (the add button)
            if (next.part.adornedObject === node) {
                return false;
            }
            // 2. the adornment is part of the selected link to or from the current node
            if (next.part.adornedObject.part instanceof go.Link) {
                var link = next.part.adornedObject.part;
                if (link.isSelected && (link.fromNode.data.key === node.data.key || link.toNode.data.key === node.data.key)) {
                    return false;
                }
            }
        }

        return true;
    }

    return $(
        go.Node,
        "Auto",
        new go.Binding("opacity", "isHidden", function(isHidden) {
            return isHidden === true ? 0.0 : 1.0;
        }), {
            name: "DecisionBranchNode",
            layerName: "Foreground",
            selectionAdorned: false,
            isShadowed: false,
            shadowColor: nodeShadowColor,
            shadowOffset: new go.Point(0, 4),
            shadowBlur: 8,
            margin: 0,
            cursor: 'pointer',
            mouseEnter: handleMouseEnterAndHover,
            mouseHover: handleMouseEnterAndHover,
            mouseLeave: function(e, node, next) {
                if (leaveNode(node, next)) {
                    dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                        node: node,
                        diagram: e.diagram,
                        highlight: false
                    });
                }
            },
            mouseHold: function(e, node) {
                if (isPreviewMode(e)) return;

                node.isShadowed = false;
                var shape = node.findObject(MAIN_NODE_SHAPE);
                shape.strokeDashArray = null;
                shape.stroke = colorPrimary1;
            },
        },
        $(
            go.Panel,
            "Auto", {
                background: 'transparent',
                padding: new go.Margin(0, BOUNDING_BOX_EXTRA_WIDTH / 2),
            },
            $(go.Shape, "Rectangle", {
                fill: 'transparent',
                position: new go.Point(0, 0),
                height: NODE_HEIGHT,
                stroke: null
            }),
            $(
                go.TextBlock,
                new go.Binding("stroke", "", function(part) {
                    return colorPrimaryText;
                }).ofObject(),
                new go.Binding("text", "branchLabel"),
                new go.Binding("font", "fontLabel"), {
                    name: MAIN_NODE_SHAPE,
                    textAlign: "center",
                    margin: 8,
                    overflow: go.TextBlock.OverflowEllipsis,
                    maxLines: 2,
                    maxSize: new go.Size(NODE_SIZE, NODE_SIZE),
                    alignment: go.Spot.Center,
                    alignmentFocus: go.Spot.Center,
                    shadowVisible: false,
                    // Below are undocumented properties, used to adjust the spacing between lines
                    spacingAbove: -1,
                    spacingBelow: -1,
                    editable: false,
                    toolTip: makeToolTip({
                        textSource: "branchLabel",
                        textBlockName: MAIN_NODE_SHAPE,
                    })
                }
            ),
            makePort(
                "c0bed67c535c20100b0cddeeff7b12fc",
                "PORT_LEFT",
                go.Spot.Left,
                new go.Spot(0, 0.5),
                new go.Spot(0, 0, -BOUNDING_BOX_EXTRA_WIDTH / 2, 0),
                false,
                true
            ),
            makePort(
                "49de92bc535c20100b0cddeeff7b12f9",
                "PORT_RIGHT",
                go.Spot.Right,
                new go.Spot(1, 0.5),
                new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2, 0),
                true,
                false
            )
        ));
}
