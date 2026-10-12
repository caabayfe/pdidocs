function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // consistent with process-designer-configuration.constants.js's ENABLE_FEATURES.STAGES
    var PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES = 'stages';

    // the shared method among shape templates
    var makeAddButton = go.go.PadCustomizationShared.makeAddButton;
    var isEditMode = go.go.PadCustomizationShared.isEditMode;
    var isPreviewMode = go.go.PadCustomizationShared.isPreviewMode;
    var isReadOnlyMode = go.go.PadCustomizationShared.isReadOnlyMode;

    var LANE_NAME_TEXTBLOCK_PANEL = "LANE_NAME_TEXTBLOCK_PANEL";
    var LANE_NODE_SHAPE = "LANE_NODE_SHAPE";
    var LANE_LABEL = "LANE_LABEL";
    var INCOMING_DANGLE_INDICATOR = "INCOMING_DANGLE_INDICATOR";
    var OUTGOING_DANGLE_INDICATOR = "OUTGOING_DANGLE_INDICATOR";
    var OUTER_PORT_CIRCLE = 'OUTER_PORT_CIRCLE';
    var INNER_PORT_CIRCLE = 'INNER_PORT_CIRCLE';

    var COLOR_NEUTRAL_19 = go.go.PadCustomizationShared.COLORS.NEUTRAL19;
    var colorPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY2);
    var colorSelectionPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SELECTION_PRIMARY2);
    var colorPrimaryText = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.TEXT_PRIMARY);
    var colorWhite = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL1);
    var nodeShadowColor = "rgba(" + resolveThemeVariable(COLOR_NEUTRAL_19, false) + ", 0.2)";
    var colorNeutral0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL0);
    var colorNeutral19 = resolveThemeVariable(COLOR_NEUTRAL_19);
    var colorBackgroundPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BACKGROUND_PRIMARY);
    var placeholderBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_TERTIARY);
    var iconsPlaceholderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BACKGROUND_PRIMARY);
    var colorGroupedGray1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GRAY1);

    // Border config.
    var BORDER_COLOR_DEFAULT = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL6);
    var BORDER_RADIUS_DEFAULT = 4;
    var BORDER_WIDTH_DEFAULT = 1;
    var BORDER_COLOR_SELECTED = colorSelectionPrimary2;
    var BORDER_WIDTH_SELECTED = 2;

    var FILL_COLOR_DEFAULT = colorWhite;

    // Label.
    var LABEL_MARGIN_BOTTOM = 4;
    var LABEL_MARGIN_LEFT = 12;
    var LABEL_MARGIN_RIGHT = 4;
    var LABEL_MARGIN_TOP = 8;

    // Lane sizes.
    var LANE_DEFAULT_HEIGHT = 184;
    var LANE_DEFAULT_WIDTH = 192;

    // Port config.
    var PORT_CIRCLE_COLOR_DEFAULT = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_SECONDARY);
    var PORT_CIRCLE_COLOR_HOVERED = colorPrimary;
    var PORT_CIRCLE_COLOR_SELECTED = colorPrimary;
    var PORT_CIRCLE_COLOR_SELECTED_HOVERED = colorPrimary2;
    var PORT_CIRCLE_FILL_DEFAULT = colorNeutral0;
    var PORT_CIRCLE_FILL_HOVERED = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SECONDARY0);
    var PORT_CIRCLE_FILL_SELECTED_HOVERED = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BRAND1);
    var PORT_CIRCLE_WIDTH_DEFAULT = 1;
    var PORT_CIRCLE_WIDTH_SELECTED = 2;
    var PORT_DOT_COLOR_DEFAULT = colorPrimary;
    var PORT_DOT_COLOR_SELECTED = colorPrimary;
    var PORT_DOT_DIAMETER_DEFAULT = 4;

    // Danging indicator config.
    var DANGLING_INDICATOR_CIRCLE_WIDTH = 1;
    var DANGLING_INDICATOR_DOT_DIAMETER = 4;
    var DANGLING_INDICATOR_INCOMING_COLOR = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.CRITICAL2);
    var DANGLING_INDICATOR_OUTGOING_COLOR = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH2);

    // Link config.
    var LINK_DOT_COLOR = colorPrimary2;
    var LINK_DOT_DIAMETER = 12;

    var ADD_BUTTON_SIZE = 16;
    var TITLE_HEIGHT = 28;
    var PORT_SIZE = 12;
    var BOUNDING_BOX_EXTRA_WIDTH = 60;
    var PORT_ADD_BUTTON_GAP = 6;
    var STAGE_TITLE_HEIGHT_INCLUDING_PADDING_AND_MARGIN =
        TITLE_HEIGHT + LABEL_MARGIN_TOP + LABEL_MARGIN_BOTTOM;

    var indicatorLayerName = "Adornment";
    var RESTART_RULE_RUN_ONLY_ONCE = 'RUN_ONLY_ONCE';

    // https://forum.nwoods.com/t/make-group-decorator-above-its-content/16306
    class GroupWithIndicators extends go.Group {
        constructor() {
            super();
        }

        updateAdornments() {
            super.updateAdornments();
            if (GroupWithIndicators.incomingIndicator === null) return;
            var adLeft = this.findAdornment(INCOMING_DANGLE_INDICATOR);
            if (adLeft === null) {
                // each Link must have its own copy of the labelTemplate
                adLeft = GroupWithIndicators.incomingIndicator.copy();
                adLeft.adornedObject = this;
                this.addAdornment(INCOMING_DANGLE_INDICATOR, adLeft);
            }
            if (GroupWithIndicators.outgoingIndicator === null) return;
            var adRight = this.findAdornment(OUTGOING_DANGLE_INDICATOR);
            if (adRight === null) {
                // each Link must have its own copy of the labelTemplate
                adRight = GroupWithIndicators.outgoingIndicator.copy();
                adRight.adornedObject = this;
                this.addAdornment(OUTGOING_DANGLE_INDICATOR, adRight);
            }
        }
    }

    GroupWithIndicators.incomingIndicator = $(
        go.Adornment,
        "Spot", {
            layerName: indicatorLayerName
        },
        $(go.Placeholder),
        $(go.Panel, "Table",
            new go.Binding("visible", "", function(data) {
                return !data.hasIncoming;
            }), {
                name: 'INDICATOR',
                alignmentFocus: new go.Spot(0, 0.5, -(BOUNDING_BOX_EXTRA_WIDTH / 2 - PORT_SIZE / 2 + 1), 0.5)
            },
            $(go.Shape, "Circle", {
                stretch: go.GraphObject.Fill,
                fill: colorWhite,
                stroke: DANGLING_INDICATOR_INCOMING_COLOR,
                strokeWidth: DANGLING_INDICATOR_CIRCLE_WIDTH,
                desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
            }),
            $(go.Shape, "Circle", {
                fill: DANGLING_INDICATOR_INCOMING_COLOR,
                stroke: DANGLING_INDICATOR_INCOMING_COLOR,
                strokeWidth: 0,
                desiredSize: new go.Size(DANGLING_INDICATOR_DOT_DIAMETER, DANGLING_INDICATOR_DOT_DIAMETER),
            })
        )
    ).copyTemplate(true);

    GroupWithIndicators.outgoingIndicator = $(
        go.Adornment,
        "Spot", {
            layerName: indicatorLayerName
        },
        $(go.Placeholder),
        $(go.Panel, "Table",
            new go.Binding("visible", "", function(data) {
                return !(data.hasOutgoing);
            }), {
                name: 'INDICATOR',
                alignmentFocus: new go.Spot(0, 0.5, BOUNDING_BOX_EXTRA_WIDTH / 2 + PORT_SIZE / 2 + 2.5, 0)
            },
            $(go.Shape, "Circle", {
                stretch: go.GraphObject.Fill,
                fill: colorWhite,
                stroke: DANGLING_INDICATOR_OUTGOING_COLOR,
                strokeWidth: DANGLING_INDICATOR_CIRCLE_WIDTH,
                desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
            }),
            $(go.Shape, "Circle", {
                fill: DANGLING_INDICATOR_OUTGOING_COLOR,
                stroke: DANGLING_INDICATOR_OUTGOING_COLOR,
                strokeWidth: 0,
                desiredSize: new go.Size(DANGLING_INDICATOR_DOT_DIAMETER, DANGLING_INDICATOR_DOT_DIAMETER),
            })
        )
    ).copyTemplate(true);

    class AlignedLayeredDigraphVertex extends go.LayeredDigraphVertex {
        constructor(net) {
            super(net);
        }

        commit() {
            var node = this.node;
            if (node !== null) {
                node.move(this.bounds.position);
            }
        }
    }

    class AlignedLayeredDigraphNetwork extends go.LayeredDigraphNetwork {
        constructor(lay) {
            super(lay);
        }

        createVertex() {
            return new AlignedLayeredDigraphVertex(this);
        }
    }

    class AlignedLayeredDigraphLayout extends go.LayeredDigraphLayout {
        constructor() {
            super();
        }

        createNetwork() {
            return new AlignedLayeredDigraphNetwork(this);
        }

        assignLayers() {
            super.assignLayers();

            var v, lay, max;

            // for every vertex, record the maximum vertex width or height for the vertex's layer
            var maxsizes = [];
            for (var it = this.network.vertexes.iterator; it.next();) {
                v = it.value;
                lay = v.layer;
                max = maxsizes[lay];
                if (max === undefined) max = 0;
                var sz = v.width;
                if (sz > max) maxsizes[lay] = sz;
            }
            // now make sure every vertex has the maximum width or height according to which layer it is in,
            // and aligned on the left (if horizontal) or the top (if vertical)
            for (it = this.network.vertexes.iterator; it.next();) {
                v = it.value;
                var node = v.node;
                if (node === null) continue;
                lay = v.layer;
                max = maxsizes[lay];
                v.focus = new go.Point(max / 2, v.focus.y);
                v.width = max;
            }
            // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
            // (other than the ones that are the widest or tallest in their respective layer).
        }

        commitLinks() {
            super.commitLinks();
            this.network.edges.each((e) => {
                var l = e.link;
                if (!l) return;

                l.updateRoute();
                var pts = l.points.copy();
                if (pts.count >= 6) {
                    var p2 = pts.elt(pts.length - 4);
                    var p3 = pts.elt(pts.length - 3);

                    var nodeX = l.toNode.position.x;
                    var x = nodeX - 25;
                    pts.setElt(pts.length - 4, new go.Point(x, p2.y));
                    pts.setElt(pts.length - 3, new go.Point(x, p3.y));
                    l.points = pts;
                }
            });
        }
    }

    class PDGroupLayout extends go.LayeredDigraphLayout {
        constructor() {
            return $(AlignedLayeredDigraphLayout, {
                layerSpacing: 50,
                layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
                alignOption: go.LayeredDigraphLayout.AlignAll,
            });
        }

        commitLinks() {
            super.commitLinks();
            this.network.edges.each((e) => {
                var l = e.link;
                if (!l) return;

                l.updateRoute();
                var pts = l.points.copy();
                if (pts.count >= 6) {
                    var p2 = pts.elt(pts.length - 4);
                    var p3 = pts.elt(pts.length - 3);

                    var nodeX = l.toNode.position.x;
                    var x = nodeX - 25;
                    pts.setElt(pts.length - 4, new go.Point(x, p2.y));
                    pts.setElt(pts.length - 3, new go.Point(x, p3.y));
                    l.points = pts;
                }
            });
        }
    }

    function makePort(args) {
        return $(go.Shape, "Circle", {
            name: args.name,
            fill: null,
            stroke: null,
            desiredSize: new go.Size(0, 0),
            alignment: args.alignment,
            alignmentFocus: args.alignmentFocus,
            portId: args.portId,
            fromSpot: args.spot,
            toSpot: args.spot,
            fromLinkable: args.isOutgoing,
            toLinkable: !args.isOutgoing,
            cursor: "pointer",
        });
    }

    function makeIcon({
        source,
        objectSource,
        addlProps
    }) {
        return $(
            go.Shape,
            new go.Binding("geometry", '', function(data) {
                var iconSVG = objectSource ? data[objectSource]?.[source] : data[source];

                if (!iconSVG)
                    return go.Geometry.parse('');
                var geometryString = '';
                // We pass in the entire SVG string from seismic. This way is better because we can use any properties on the SVG here
                // instead of passing a bunch of different properties from the node data. for example, if there's a fill rule like 'evenodd', or any other properties.
                var parsedSvg = new DOMParser().parseFromString(iconSVG, "image/svg+xml");
                var paths = parsedSvg.getElementsByTagName("path");
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    var pathD = path.getAttribute("d");
                    var fillRule = path.getAttribute("fill-rule");
                    if (typeof pathD === "string") {
                        if (fillRule === 'evenodd' || !fillRule)
                            geometryString = geometryString.concat('F0');
                        geometryString = geometryString.concat(pathD);
                    }
                }
                var geo = go.Geometry.parse(geometryString);
                geo.normalize();
                return geo;
            }), {
                stroke: null,
                fill: colorPrimaryText,
                ...addlProps
            }
        );
    }

    function makeIconWithBackground({
        icon,
        toolTip,
        getIsShow,
        getBackgroundColor,
        getBorderColor,
        margin,
        shouldHighlightOnHover = true
    }) {
        if (typeof getIsShow !== 'function')
            getIsShow = function() {
                return false;
            };
        if (typeof getBackgroundColor !== 'function') {
            getBackgroundColor = function() {
                return 'transparent';
            };
        }
        if (typeof getBorderColor !== 'function') {
            getBorderColor = function() {
                return 'transparent';
            };
        }
        var backgroundShapeConfig = {
            strokeWidth: 1,
            parameter1: 2,
            width: 16,
            height: 16,
        };
        if (shouldHighlightOnHover) {
            backgroundShapeConfig = {
                ...backgroundShapeConfig,
                mouseEnter: function(e, shape, prev) {
                    if (isPreviewMode(e)) return;

                    if (shape?.panel === prev?.panel)
                        return;
                    var fill = getBackgroundColor(shape?.part?.data);
                    if (isValidHexColor(fill))
                        shape.fill = shadeColor(fill, 10);
                },
                mouseLeave: function(e, shape, next) {
                    if (shape?.panel === next?.panel)
                        return;
                    shape.fill = getBackgroundColor(shape?.part?.data);
                }
            };
        }
        return $(
            go.Panel,
            "Auto", {
                margin: margin || new go.Margin(0, 2, 0, 2),
                toolTip
            },
            new go.Binding("visible", "", function(data) {
                return getIsShow(data);
            }),
            $(
                go.Shape,
                "RoundedRectangle",
                backgroundShapeConfig,
                new go.Binding("fill", "", function(data) {
                    return getIsShow(data) &&
                        getBackgroundColor(data) ||
                        'transparent';
                }),
                new go.Binding("stroke", "", function(data) {
                    return getIsShow(data) &&
                        getBorderColor(data) ||
                        'transparent';
                })
            ),
            icon
        );
    }

    function disableCondition(data, name) {
        return !data.hasIncoming && name === "ADD_BUTTON_LEFT";
    }

    /**
     * Creates tooltip for text based source object
     * @param {String} args.textSource - Source object name to attach tooltip to
     * @param {String} [args.textBlockName] - Name of the textblock whose text needs to be
     * 		checked for truncation
     * @returns {go.Adornment}
     */
    function getTooltipForText({
        textSource,
        textBlockName
    }) {
        return makeTooltip({
            textSource,
            getIsShow: function(obj) {
                // If we're not checking if a textblock is truncated, then
                // the tooltip is always visible
                if (!textBlockName)
                    return true;
                // Only render if text ends with ellipsis
                try {
                    var nameTextBlock = obj.adornedPart.findObject(textBlockName);
                    var textLines = nameTextBlock.metrics.arrText;
                    var lastLine = textLines[textLines.length - 1];
                    return !!lastLine.endsWith("...");
                } catch {
                    return false;
                }
            }
        });
    }

    function makeTooltip({
        textSource,
        getTooltipText,
        getIsShow
    }) {
        if (!textSource)
            return;
        if (typeof getTooltipText !== 'function')
            getTooltipText = function(sourceValue) {
                return sourceValue;
            };
        if (typeof getIsShow !== 'function')
            getIsShow = function() {
                return true;
            };
        return $(
            go.Adornment,
            "Spot",
            new go.Binding("visible", "", function(obj) {
                return getIsShow(obj);
            }).ofObject(),
            $(
                go.Panel,
                "Auto",
                $(go.Shape, {
                    name: "toolTipBackground",
                    figure: "RoundedRectangle",
                    // parameter1 is border-radius
                    parameter1: 4,
                    fill: colorNeutral19,
                    stroke: colorNeutral19,
                }),
                $(
                    go.TextBlock,
                    new go.Binding("text", textSource, getTooltipText), {
                        stroke: colorNeutral0,
                        maxSize: new go.Size(320, NaN),
                        margin: new go.Margin(4, 8, 4, 8),
                    }
                )
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
            width: LINK_DOT_DIAMETER,
            height: LINK_DOT_DIAMETER,
            fill: LINK_DOT_COLOR,
            stroke: LINK_DOT_COLOR,
            segmentIndex: 0,
        });
    }

    function renderOutgoingPort(showPort, isSelected, portAlignment) {
        if (showPort) {
            return $(
                go.Panel, "Table",
                new go.Binding("mouseEnter", "", function(adornment) {
                    return function(e, obj) {
                        if (!isEditMode(e)) return;

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        if (adornment.adornedPart.isSelected && adornment.data.hasOutgoing) {
                            outerPortCircle.stroke = PORT_CIRCLE_COLOR_SELECTED_HOVERED;
                            outerPortCircle.fill = PORT_CIRCLE_FILL_HOVERED;
                            innerPortCircle.fill = PORT_CIRCLE_COLOR_SELECTED_HOVERED;
                        } else {
                            outerPortCircle.stroke = PORT_CIRCLE_COLOR_HOVERED;
                            outerPortCircle.fill = PORT_CIRCLE_FILL_HOVERED;
                            innerPortCircle.fill = PORT_CIRCLE_COLOR_HOVERED;
                        }
                    };
                }).ofObject(), {
                    alignment: portAlignment,
                    alignmentFocus: new go.Spot(0, 0.5, BOUNDING_BOX_EXTRA_WIDTH / 2 + PORT_SIZE / 2 + 2.5, 0),
                    cursor: "pointer",
                    isActionable: true,
                    actionMove: drawLink,
                    mouseHover: function(e) {
                        if (!isEditMode(e)) return;

                        var eventClientX = e.event.clientX;
                        var eventClientY = e.event.clientY;

                        var tooltipLocation = {
                            x: eventClientX,
                            y: eventClientY
                        };

                        dispatch("PAD#DIAGRAM_SHOW_TOOLTIP", {
                            type: 'node_connector',
                            location: tooltipLocation
                        });
                    },
                    mouseLeave: function() {
                        dispatch("PAD#DIAGRAM_HIDE_TOOLTIP");
                    }
                },
                $(go.Shape, "Circle",
                    new go.Binding("stroke", "", function(data) {
                        if (!data.hasOutgoing) {
                            return DANGLING_INDICATOR_OUTGOING_COLOR;
                        } else if (isSelected) {
                            return PORT_CIRCLE_COLOR_SELECTED;
                        } else {
                            return resolveThemeVariable(data.borderColor) || PORT_CIRCLE_COLOR_DEFAULT;
                        }
                    }),
                    new go.Binding("strokeWidth", "hasOutgoing", function(hasOutgoing) {
                        return isSelected && hasOutgoing ? PORT_CIRCLE_WIDTH_SELECTED : PORT_CIRCLE_WIDTH_DEFAULT;
                    }), {
                        name: OUTER_PORT_CIRCLE,
                        stretch: go.GraphObject.Fill,
                        fill: PORT_CIRCLE_FILL_DEFAULT,
                        desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
                    }),
                $(go.Shape, "Circle", new go.Binding("fill", "hasOutgoing", function(hasOutgoing) {
                    return hasOutgoing ?
                        isSelected ?
                        PORT_DOT_COLOR_SELECTED :
                        PORT_DOT_COLOR_DEFAULT :
                        DANGLING_INDICATOR_OUTGOING_COLOR;
                }), {
                    name: INNER_PORT_CIRCLE,
                    strokeWidth: 0,
                    desiredSize: new go.Size(PORT_DOT_DIAMETER_DEFAULT, PORT_DOT_DIAMETER_DEFAULT),
                })
            );
        } else {
            return {};
        }
    }

    function formNodeHoverAdornment(diagram, node, showPort) {
        var portAlignment = new go.Spot(1, 0.5);
        var leftButtonAlignment = new go.Spot(0, 0.5);
        var rightButtonAlignment = new go.Spot(1, 0.5);

        if (!node.data.empty) {
            var laneKey = node.data.key;
            var virtualStart = diagram.findNodeForKey(laneKey + '-virtual-start');
            var virtualEnd = diagram.findNodeForKey(laneKey + '-virtual-end');
            var laneBounds = node.actualBounds;
            var startBounds = virtualStart.actualBounds;
            var endBounds = virtualEnd.actualBounds;
            var leftVerticalOffset = startBounds.y - laneBounds.y + startBounds.height / 2;
            var rightVerticalOffset = endBounds.y - laneBounds.y + endBounds.height / 2;

            portAlignment = new go.Spot(1, 0, 0, rightVerticalOffset);
            leftButtonAlignment = new go.Spot(0, 0, 0, leftVerticalOffset);
            rightButtonAlignment = new go.Spot(1, 0, 0, rightVerticalOffset);
        }

        var xOffset = BOUNDING_BOX_EXTRA_WIDTH / 2 - PORT_SIZE / 2 - PORT_ADD_BUTTON_GAP - ADD_BUTTON_SIZE;
        return $(
            go.Adornment,
            "Spot",
            $(
                go.Panel,
                "Auto",
                $(go.Shape, {
                    fill: null,
                    stroke: null
                }),
                $(go.Placeholder, {})
            ),
            renderOutgoingPort(showPort, node.isSelected, portAlignment),
            makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: "ADD_BUTTON_LEFT",
                    label: "+",
                    alignment: leftButtonAlignment,
                    alignmentFocus: new go.Spot(0, 0.5, -xOffset, 0),
                    mode: "standard",
                    disableCondition: disableCondition,
                    clickHandler: function(event, btn) {
                        if (!isEditMode(btn)) return;

                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: btn.part.data,
                            nodeContext: {
                                addType: 'addLeft',
                                nodeType: 'lane'
                            }
                        });
                    }
                }
            ),
            makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: "ADD_BUTTON_RIGHT",
                    label: "+",
                    alignment: rightButtonAlignment,
                    alignmentFocus: new go.Spot(1, 0.5, xOffset, 0),
                    mode: "standard",
                    disableCondition: disableCondition,
                    clickHandler: function(event, btn) {
                        if (!isEditMode(btn)) return;

                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: btn.part.data,
                            nodeContext: {
                                addType: 'addRight',
                                nodeType: 'lane'
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

    function supportStages(diagramModelData) {
        return diagramModelData[PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES]
    }

    function handleMouseEnterHoverAndClick(e, node) {
        if (isReadOnlyMode(e)) {
            node.isShadowed = true;
        }
        if (!isEditMode(e)) return;

        if (supportStages(e.diagram.model.modelData)) {
            var nodeHoverAdornment = formNodeHoverAdornment(e.diagram, node, showAdornmentWithPort(node));

            dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                node: node,
                adornment: nodeHoverAdornment,
                diagram: e.diagram,
                highlight: true
            });
        }

        dispatch("PAD#DIAGRAM_LANE_START_HIGHLIGHTED", {
            node: node,
            diagram: e.diagram,
            highlight: true
        });
    }

    function handleMouseLeave(e, node, next) {
        if (isReadOnlyMode(e)) {
            node.isShadowed = false;
        }
        if (leaveNode(node, next)) {
            if (supportStages(e.diagram.model.modelData)) {
                dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                    node: node,
                    diagram: e.diagram,
                    highlight: false
                });
            }

            dispatch("PAD#DIAGRAM_LANE_START_HIGHLIGHTED", {
                node: node,
                diagram: e.diagram,
                highlight: false
            });
        }
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

        // if hover a link inside the lane, do not consider as leaving the lane
        if (next?.part instanceof go.Link) {
            if (next.part?.fromNode?.data?.group === node.data.key && next.part?.toNode?.data?.group === node.data.key) {
                return false;
            }
        }

        // if hover the lane virtual start or end, do not consider as leaving the lane
        var nextPartKey = next?.part?.data?.key;
        if (nextPartKey === node.data.key + '-virtual-start' || nextPartKey === node.data.key + '-virtual-end') {
            return false;
        }

        return true;
    }

    function dataHasError(data) {
        return !!data?.errors?.hasErrors;
    }

    function isShowRestartRule(data) {
        return (
            !!data?.restart?.rule?.value &&
            data.restart.rule.value !== RESTART_RULE_RUN_ONLY_ONCE
        );
    }

    function isValidHexColor(color) {
        return /^#[0-9A-F]{6}$/i.test(color);
    }

    function shadeColor(color, percent) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 - percent) / 100);
        G = parseInt(G * (100 - percent) / 100);
        B = parseInt(B * (100 - percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    return $(
        GroupWithIndicators,
        "Spot",
        new go.Binding("selectable", "", function(data) {
            return supportStages(data);
        }).ofModel(), {
            layout: $(PDGroupLayout, {
                layerSpacing: 50,
                layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
                alignOption: go.LayeredDigraphLayout.AlignAll
            }),
            selectable: true,
            selectionAdorned: false,
            isShadowed: false,
            shadowColor: nodeShadowColor,
            shadowOffset: new go.Point(6, 6),
            shadowBlur: 8,
            click: handleMouseEnterHoverAndClick,
            mouseEnter: handleMouseEnterHoverAndClick,
            mouseHover: handleMouseEnterHoverAndClick,
            mouseLeave: handleMouseLeave
        },
        $(go.Panel, "Horizontal",
            $(go.Shape, "Rectangle", {
                width: BOUNDING_BOX_EXTRA_WIDTH / 2,
                fill: "transparent",
                strokeWidth: 0,
                stretch: go.GraphObject.Fill
            }),
            // The following panel and rounded rect provide a white background to heighten the color and mask the drop
            // shadow since it shows through the semi-opaque background of the child rounded rect.
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", {
                    parameter1: BORDER_RADIUS_DEFAULT,
                    fill: colorBackgroundPrimary,
                    shadowVisible: true,
                    strokeWidth: 0,
                    spot1: go.Spot.TopLeft,
                    spot2: go.Spot.BottomRight
                }),
                $(go.Panel, "Auto",
                    // https://forum.nwoods.com/t/shape-strokewidth-change-without-affecting-its-size/16308
                    // Make sure that changing the strokeWidth does not affect the size of the lane and thus does not affect the lane-level link routing
                    $(go.Panel, "Table",
                        $(go.Shape, "RoundedRectangle", // surrounds everything
                            {
                                parameter1: BORDER_RADIUS_DEFAULT,
                                name: LANE_NODE_SHAPE,
                                spot1: go.Spot.TopLeft,
                                spot2: go.Spot.BottomRight,
                                stretch: go.GraphObject.Fill,
                            },
                            new go.Binding("fill", "", function(data) {
                                if (data.fillColor)
                                    // Add opacity 25% alpha channel to the hex value of the fill
                                    return resolveThemeVariable(data.fillColor, /*performHexConversion*/true) + '40';
                                else
                                    return FILL_COLOR_DEFAULT;
                            }),
                            new go.Binding("stroke", "", function(part) {
                                if (part.isSelected && !isPreviewMode(part))
                                    return BORDER_COLOR_SELECTED;
                                else if (dataHasError(part.data))
                                    return resolveThemeVariable(part.data?.errors?.borderColor);
                                else if (part.data.borderColor)
                                    return resolveThemeVariable(part.data.borderColor);
                                else
                                    return BORDER_COLOR_DEFAULT;
                            }).ofObject(),
                            new go.Binding("strokeWidth", "", function(part) {
                                if ((part.isSelected && !isPreviewMode(part)) || dataHasError(part?.data))
                                    return BORDER_WIDTH_SELECTED;
                                else
                                    return BORDER_WIDTH_DEFAULT;
                            }).ofObject()
                        ),
                        // ** Stage Main Content **
                        $(
                            go.Panel,
                            "Table",
                            // Row 1 - Stage Title
                            $(
                                go.Panel, {
                                    row: 1,
                                    height: TITLE_HEIGHT,
                                    name: LANE_NAME_TEXTBLOCK_PANEL,
                                    padding: new go.Margin(
                                        LABEL_MARGIN_TOP,
                                        LABEL_MARGIN_RIGHT,
                                        LABEL_MARGIN_BOTTOM,
                                        LABEL_MARGIN_LEFT
                                    ),
                                    alignment: go.Spot.TopLeft,
                                    stretch: go.GraphObject.Horizontal,
                                },
                                $(
                                    go.TextBlock, // stage title near top, next to button
                                    new go.Binding("text", "label"),
                                    new go.Binding("stroke", "", function(part) {
                                        if (part.data.textColor)
                                            return resolveThemeVariable(part.data.textColor);
                                    }).ofObject(),
                                    new go.Binding("font", "", function(data) {
                                        return data.labelFont;
                                    }), {
                                        name: LANE_LABEL,
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        maxLines: 1,
                                        toolTip: getTooltipForText({
                                            textSource: "label",
                                            textBlockName: LANE_LABEL,
                                        })
                                    }
                                ),
                            ),
                            // Row 2 - Empty Stage
                            $(
                                go.Panel,
                                "Spot", {
                                    row: 2,
                                    desiredSize: new go.Size(LANE_DEFAULT_WIDTH, LANE_DEFAULT_HEIGHT)
                                },
                                new go.Binding("visible", "empty"),
                                // need this Shape to put the add button in the center
                                $(
                                    go.Shape,
                                    "Rectangle", {
                                        desiredSize: new go.Size(LANE_DEFAULT_WIDTH, LANE_DEFAULT_HEIGHT),
                                        fill: "transparent",
                                        stroke: null
                                    }
                                ),
                                makeAddButton(
                                    $,
                                    go,
                                    dispatch,
                                    resolveThemeVariable, {
                                        name: "ADD_BUTTON_CENTER",
                                        label: "+",
                                        alignment: new go.Spot(0.5, 0.5),
                                        alignmentFocus: go.Spot.Center,
                                        mode: "primary",
                                        disableCondition: disableCondition,
                                        clickHandler: function(event, btn) {
                                            if (!isEditMode(btn)) return;

                                            var laneKey = btn.part.data.key;
                                            dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                                                type: "picker",
                                                position: btn.getDocumentPoint(go.Spot.Center),
                                                nodeData: {
                                                    key: laneKey + '-virtual-start'
                                                },
                                                nodeContext: 'addRight'
                                            });
                                        }
                                    }
                                )
                            ),
                            // Row 2 - Stage with Activities
                            $(
                                go.Placeholder, // represents area for all member parts
                                {
                                    row: 2,
                                    name: "LANE_ACTIVITIES_CONTAINER",
                                    padding: new go.Margin(4, 0, 4, -6),
                                    minSize: new go.Size(LANE_DEFAULT_WIDTH, LANE_DEFAULT_HEIGHT),
                                },
                                new go.Binding("visible", "empty", function(value) {
                                    return !value;
                                }),
                                new go.Binding("fill", "", function(data) {
                                    return resolveThemeVariable(data.fillColor) || colorWhite;
                                })
                            ),
                            // Row 3 - Additional height to offset Stage Title
                            $(
                                go.Panel,
                                "Auto", {
                                    row: 3,
                                    height: STAGE_TITLE_HEIGHT_INCLUDING_PADDING_AND_MARGIN,
                                    stretch: go.GraphObject.Fill
                                }
                            )
                        ),
                        // ** Stage icons **
                        // Such as Errors and Restart Rule. This is strategically drawn
                        // after and over the Stage Main Content. It's absolute positioned
                        // so that it appears to be underneath the Stage Title without
                        // taking up actual space that can increase the Stage height
                        $(
                            go.Panel,
                            "Spot", {
                                alignment: new go.Spot(
                                    0,
                                    0,
                                    LABEL_MARGIN_LEFT,
                                    TITLE_HEIGHT
                                )
                            },
                            new go.Binding("visible", "", function(data) {
                                return dataHasError(data) || isShowRestartRule(data);
                            }),
                            $(
                                go.Shape,
                                "RoundedRectangle", {
                                    stroke: placeholderBorderColor
                                },
                                {
                                    strokeWidth: 1,
                                    parameter1: 2,
                                    width: 90,
                                    height: 22
                                },
                                new go.Binding("fill", "",
                                    function(data) {
                                        return data.shouldFillGray && !data?.override?.showOverride ?
                                            colorGroupedGray1 :
                                            iconsPlaceholderColor;
                                    })
                            ),
                            $(
                                go.Panel,
                                "Horizontal",
                                makeIconWithBackground({
                                    icon: makeIcon({
                                        source: 'icon',
                                        objectSource: 'errors'
                                    }),
                                    toolTip: makeTooltip({
                                        textSource: 'errors',
                                        getTooltipText: function(textSourceValue) {
                                            return textSourceValue?.message;
                                        }
                                    }),
                                    getIsShow: function(data) {
                                        return dataHasError(data);
                                    },
                                    getBackgroundColor: function(data) {
                                        return resolveThemeVariable(data?.errors?.color);
                                    },
                                    getBorderColor: function(data) {
                                        return resolveThemeVariable(data?.errors?.borderColor);
                                    }
                                }),
                                makeIconWithBackground({
                                    icon: makeIcon({
                                        source: 'icon',
                                        objectSource: 'restart'
                                    }),
                                    toolTip: makeTooltip({
                                        textSource: 'restart',
                                        getTooltipText: function(textSourceValue) {
                                            return textSourceValue?.rule?.displayValue;
                                        }
                                    }),
                                    getIsShow: function(data) {
                                        return isShowRestartRule(data);
                                    },
                                    getBackgroundColor: function(data) {
                                        return data?.restart?.color;
                                    },
                                    getBorderColor: function(data) {
                                        return data?.restart?.borderColor;
                                    }
                                })
                            )
                        ),
                        $(
                            go.Panel,
                            "Horizontal", {
                                alignment: new go.Spot(
                                    1,
                                    0,
                                    -LABEL_MARGIN_LEFT,
                                    LABEL_MARGIN_TOP
                                )
                            },
                            new go.Binding("visible", "", function(data, shape) {
                                return isReadOnlyMode(shape.part) && shape.part.isSelected;
                            }),
                            makeIcon({
                                source: 'icon',
                                objectSource: 'eyeIconOutline',
                                addlProps: {
                                    fill: colorPrimaryText,
                                    margin: new go.Margin(2),
                                }
                            }),
                        ),
                    )
                )
            ),
            $(go.Shape, "Rectangle", {
                width: BOUNDING_BOX_EXTRA_WIDTH / 2,
                fill: "transparent",
                strokeWidth: 0,
                stretch: go.GraphObject.Fill
            })
        ),
        makePort({
            portId: "c0bed67c535c20100b0cddeeff7b12fc",
            name: "PORT_LEFT",
            spot: go.Spot.Left,
            alignment: new go.Spot(0, 0.5),
            alignmentFocus: new go.Spot(0.5, 1, -(BOUNDING_BOX_EXTRA_WIDTH / 2), 0),
            isOutgoing: false
        }),
        makePort({
            portId: "49de92bc535c20100b0cddeeff7b12f9",
            name: "PORT_RIGHT",
            spot: go.Spot.Right,
            alignment: new go.Spot(1, 0.5),
            alignmentFocus: new go.Spot(0.5, 1, BOUNDING_BOX_EXTRA_WIDTH / 2 + 1, 0),
            isOutgoing: true
        })
    );
}
