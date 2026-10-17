function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // consistent with process-designer-configuration.constants.js's ENABLE_FEATURES.STAGES
    var PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES = 'stages';

    // the shared method among shape templates
    var makeAddButton = go.go.PadCustomizationShared.makeAddButton;
    var isEditMode = go.go.PadCustomizationShared.isEditMode;
    var isPreviewMode = go.go.PadCustomizationShared.isPreviewMode;
    var makeEvaluationPointButton = go.go.PadCustomizationShared.makeEvaluationPointButton;
    var PAD__OPEN_DEFERRED_VARIANT_MODAL =
        'PAD#OPEN_DEFERRED_VARIANT_MODAL';
    var NODE_HEIGHT = 30;
    var BUTTON_TRAY_PADDING = 4;
    var BOUNDING_BOX_EXTRA_HEIGHT = 16;
    var BOUNDING_BOX_EXTRA_WIDTH = 60;
    var ADD_BUTTON_SIZE = 16;
    var PORT_SIZE = 12;
    var PORT_ADD_BUTTON_GAP = 6;
    var ERROR_TEXT_BLOCK = 'ERROR_TEXT_BLOCK';
    var OUTER_PORT_CIRCLE = 'OUTER_PORT_CIRCLE';
    var INNER_PORT_CIRCLE = 'INNER_PORT_CIRCLE';
    var OUTGOING_DANGLE_INDICATOR = 'OUTGOING_DANGLE_INDICATOR';
    var OUTGOING_PORT_ALIGNMENT = new go.Spot(
        1,
        0.5,
        -BOUNDING_BOX_EXTRA_WIDTH / 2 + 1,
        0
    );

    var colorBorderSecondary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_SECONDARY);
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY2);
    var colorPrimaryText = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.TEXT_PRIMARY);
    var colorNeutral0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL0);
    var colorNeutral19 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL19);
    var colorAlertHigh2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH2);
    var colorSurfaceBrand1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BRAND1);
    var colorCritical2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.CRITICAL2);
    var colorGroupedGreen0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GREEN0);
    var colorGroupedGreen4 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GREEN4);

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

    function showTooltipOnMouseEvent(type) {
        return function(e) {
            if (!isEditMode(e)) return;

            var eventClientX = e.event?.clientX;
            var eventClientY = e.event?.clientY;

            var tooltipLocation = {
                x: eventClientX,
                y: eventClientY
            };

            dispatch("PAD#DIAGRAM_SHOW_TOOLTIP", {
                type,
                location: tooltipLocation
            });
        };
    }

    function hideTooltip() {
        dispatch("PAD#DIAGRAM_HIDE_TOOLTIP");
    }

    function renderPort(node, showPort) {
        if (showPort) {
        var portAlignment = new go.Spot(
            1,
            0,
            node.isShowEvaluationPointAfterProcessStart
                ? -BOUNDING_BOX_EXTRA_WIDTH - PORT_SIZE
                : -BOUNDING_BOX_EXTRA_WIDTH / 2 - 42,
            BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_HEIGHT / 2 + BUTTON_TRAY_PADDING
        );
            return $(
                go.Panel, "Table",
                new go.Binding("mouseEnter", "", function(adornment) {
                    return function(e, obj) {
                        if (!isEditMode(obj)) return;

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        if (adornment.adornedPart.isSelected && adornment.data.hasOutgoing) {
                            outerPortCircle.stroke = colorPrimary2;
                            innerPortCircle.fill = colorPrimary2;
                        } else {
                            outerPortCircle.stroke = colorPrimary1;
                            innerPortCircle.fill = colorPrimary1;
                        }
                        outerPortCircle.fill = colorSurfaceBrand1;
                    };
                }).ofObject(),
                new go.Binding('cursor', '', function(data, btn) {
                    return !isEditMode(btn) ? 'default' : 'pointer';
                }), {
                    alignment: portAlignment,
                    alignmentFocus: go.Spot.Center,
                    isActionable: true,
                    actionMove: drawLink,
                    mouseHover: showTooltipOnMouseEvent('node_connector'),
                    mouseEnter: function(e, obj) {
                        if (!isEditMode(e)) return;

                        var outerPortCircle = obj.part.findObject(OUTER_PORT_CIRCLE);
                        var innerPortCircle = obj.part.findObject(INNER_PORT_CIRCLE);
                        outerPortCircle.stroke = colorPrimary1;
                        outerPortCircle.fill = colorSurfaceBrand1;
                        innerPortCircle.fill = colorPrimary1;
                    },
                    mouseLeave: hideTooltip
                },
                $(go.Shape, "Circle",
                    new go.Binding("stroke", "", function(part) {
                        if (part.data.hasOutgoing) {
                            if (part.data.color) {
                                return go.Brush.darkenBy(part.data.color, 0.4);
                            } else {
                                return colorBorderSecondary;
                            }
                        } else {
                            return colorAlertHigh2;
                        }
                    }).ofObject(), {
                        name: OUTER_PORT_CIRCLE,
                        stretch: go.GraphObject.Fill,
                        fill: colorNeutral0,
                        strokeWidth: 1,
                        desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
                    }),
                $(go.Shape, "Circle",
                    new go.Binding("fill", "hasOutgoing", function(hasOutgoing) {
                        return hasOutgoing ? colorPrimary1 : colorAlertHigh2;
                    }), {
                        name: INNER_PORT_CIRCLE,
                        strokeWidth: 0,
                        desiredSize: new go.Size(PORT_SIZE / 3, PORT_SIZE / 3),
                    })
            );
        } else {
            return {};
        }
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
            }),
            new go.Binding("fill", "", function(data, part) {
                if (dataHasError(data) && objectSource === 'errors' && !isPreviewMode(part)) return colorNeutral0;
                else if (objectSource === 'startIcon' && data.isStart) return colorNeutral0;
                else return colorPrimaryText;
            }), {
                stroke: null,
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
            new go.Binding("visible", "", function(data, part) {
                return getIsShow(data, part);
            }),
            $(
                go.Shape,
                "RoundedRectangle",
                backgroundShapeConfig,
                new go.Binding("fill", "", function(data, part) {
                    return getIsShow(data, part) ?
                        getBackgroundColor(data) :
                        'transparent';
                }),
                new go.Binding("stroke", "", function(data, part) {
                    return getIsShow(data, part) ?
                        getBorderColor(data) :
                        'transparent';
                })
            ),
            icon
        );
    }	
    function formNodeHoverAdornment(node, showPort) {
    var addButtonAlignment = new go.Spot(
        1,
        0,
        node.isShowEvaluationPointAfterProcessStart
            ? -BOUNDING_BOX_EXTRA_WIDTH / 2 + ADD_BUTTON_SIZE
            : -BOUNDING_BOX_EXTRA_WIDTH / 2 - 30,
        BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_HEIGHT / 2 + BUTTON_TRAY_PADDING
    );
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
            renderPort(node, showPort),
            makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: "ADD_BUTTON_RIGHT",
                    label: "+",
                    alignment: addButtonAlignment,
                    alignmentFocus: go.Spot.Left,
                    mode: "standard",
                    clickHandler: function(e, btn) {
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

    function supportStages(diagramModelData) {
        return diagramModelData[PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES];
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

    var showStartDisabledTooltip = showTooltipOnMouseEvent('variant_process_start_node');

    function handleMouseEnterAndHover(e, node) {
        if (!supportStages(e.diagram.model.modelData))
            return;

        if (node.data.key.endsWith('end')) return;

        if (!isEditMode(e)) return;

        var nodeHoverAdornment = formNodeHoverAdornment(node.data, showAdornmentWithPort(node));
        dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
            node: node,
            diagram: e.diagram,
            adornment: nodeHoverAdornment,
            highlight: true
        });

        if (node.data.isVariantSelected) {
            showStartDisabledTooltip(e);
        }
    }

    /**
     * Creates shapes for concentric circle indicator
     * @param args - Object containing name, alignment, color (for stroke and fill), and visibilityFunc
     * @returns GoJS Panel
     */
    function makeDanglingIndicator(args) {
        return $(go.Panel, "Table", new go.Binding("visible", "", args.visibilityFunc), {
                name: args.name,
                alignment: args.alignment,
                alignmentFocus: go.Spot.Center,
            },
            $(go.Shape, "Circle", {
                stretch: go.GraphObject.Fill,
                fill: colorNeutral0,
                stroke: args.color,
                strokeWidth: 1,
                desiredSize: new go.Size(PORT_SIZE, PORT_SIZE),
            }),
            $(go.Shape, "Circle", {
                fill: args.color,
                stroke: args.color,
                strokeWidth: 0,
                desiredSize: new go.Size(PORT_SIZE / 3, PORT_SIZE / 3)
            }));
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
        if (!isEditMode(e)) return;

        if (!supportStages(e.diagram.model.modelData))
            return;

        if (node.data.key.endsWith('end')) return;

        if (leaveNode(node, next)) {
            dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                node: node,
                diagram: e.diagram,
                highlight: false
            });
        }

        hideTooltip();
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

    function dataHasError(data) {
        return !!data?.errors?.hasErrors;
    }

    function shouldShowEvaluationPoint(data) {
        return !!(data?.isStart && data?.isShowEvaluationPointAfterProcessStart);
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
        go.Node,
        "Spot", {
            layerName: "Foreground",
            selectionAdorned: false,
            mouseEnter: handleMouseEnterAndHover,
            mouseHover: handleMouseEnterAndHover,
            mouseLeave: handleMouseLeave
        },
        $(go.Shape, "Rectangle",
            new go.Binding("width", "", function(node) {
                if (node && node.findObject) {
                    var container = node.findObject("START_END_NODE_CONTAINER");
                    if (container && container.actualBounds) {
                        return container.actualBounds.width;
                    }
                }
                return BOUNDING_BOX_EXTRA_WIDTH;
            }).ofObject(), {
                height: NODE_HEIGHT + BOUNDING_BOX_EXTRA_HEIGHT + (BUTTON_TRAY_PADDING * 2),
                fill: "transparent",
                strokeWidth: 0,
            }),
        $(go.Panel, "Horizontal", {
                name: "START_END_NODE_CONTAINER",
            },
            $(go.Shape, "Rectangle", {
                height: NODE_HEIGHT + BOUNDING_BOX_EXTRA_HEIGHT,
                width: BOUNDING_BOX_EXTRA_WIDTH / 2,
                fill: "transparent",
                strokeWidth: 0,
                stretch: go.GraphObject.Fill
            }),
            $(
                go.Panel,
                "Auto",
                $(
                    go.Shape,
                    "RoundedCornerRectangle", {
                        name: "PROCESS_START_END_NODE_SHAPE",
                    },
                    new go.Binding("fill", "", function(data) {
                        return resolveThemeVariable(data.color);
                    }),
                    new go.Binding('stroke', '', function(part) {
                        return part.isSelected ?
                            colorPrimary1 :
                            isPreviewMode(part) ?
                            null :
                            resolveThemeVariable(part.data?.errors?.borderColor) ?? null;
                    }).ofObject(),
                    new go.Binding('strokeWidth', '', function(data) {
                        return 2;
                    })
                ),
                $(
                    go.Panel,
                    "Horizontal", {
                        margin: new go.Margin(9, 12, 9, 12),
                    },
                    makeIconWithBackground({
                        icon: makeIcon({
                            source: 'icon',
                            objectSource: 'startIcon'
                        }),
                        getIsShow: function(data) {
                            return data?.isStart;
                        }
                    }),
                    $(go.TextBlock, new go.Binding("text", "label"),
                        new go.Binding('cursor', '', function(data, btn) {
                            return isPreviewMode(btn) ? 'default' : 'pointer';
                        }), {
                            stroke: "white",
                            textAlign: "center",
                        }, new go.Binding("font", "labelFont"))
                )
            ),
            $(go.Shape, "Rectangle", {
                height: NODE_HEIGHT + BOUNDING_BOX_EXTRA_HEIGHT,
                width: BOUNDING_BOX_EXTRA_WIDTH / 2,
                fill: "transparent",
                strokeWidth: 0,
                stretch: go.GraphObject.Fill
            })
        ),
        $(go.Shape, "Rectangle", {
            height: NODE_HEIGHT + BOUNDING_BOX_EXTRA_HEIGHT,
            width: 4 * BOUNDING_BOX_EXTRA_WIDTH / 2,
            alignment: new go.Spot(1, 0,
                -BOUNDING_BOX_EXTRA_WIDTH / 2 + PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP,
                BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_HEIGHT / 2 + BUTTON_TRAY_PADDING
            ),
            fill: "transparent",
            strokeWidth: 0,
            stretch: go.GraphObject.Fill
        }),

        makeDanglingIndicator({
            name: OUTGOING_DANGLE_INDICATOR,
            alignment: OUTGOING_PORT_ALIGNMENT,
            color: colorAlertHigh2,
            visibilityFunc: function(data) {
                return data.isStart && !data.hasOutgoing;
            }
        }),
        makeEvaluationPointButton(
            $,
            go,
            dispatch,
            resolveThemeVariable, {
                name: 'EVALUATION_POINT_BUTTON',
                alignment: new go.Spot(1, 0,
                    -BOUNDING_BOX_EXTRA_WIDTH / 2 + PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP,
                    BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_HEIGHT / 2 + BUTTON_TRAY_PADDING
                ),
                alignmentFocus: go.Spot.Left,
                clickHandler: function(e, btn) {
                    dispatch(PAD__OPEN_DEFERRED_VARIANT_MODAL);
                    dispatch('PAD#POPOVERS_DISMISSED');
                },
                icon: makeIcon({
                    source: 'icon',
                    objectSource: 'evaluationIcon'
                }),
                isVisible: new go.Binding("visible", '', function(data) {
                    return shouldShowEvaluationPoint(data);
                })
            }
        ),
        makePort(
            "c0bed67c535c20100b0cddeeff7b12fc",
            "PORT_LEFT",
            go.Spot.Left,
            new go.Spot(0, 0.5),
            new go.Spot(0.5, 1, -BOUNDING_BOX_EXTRA_WIDTH / 2, 0),
            false,
            true
        ),
        makePort(
            "49de92bc535c20100b0cddeeff7b12f9",
            "PORT_RIGHT",
            go.Spot.Right,
            OUTGOING_PORT_ALIGNMENT,
            go.Spot.Center,
            true,
            false
        ),
        $(
            go.Panel,
            "Horizontal", {
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.TopCenter
            },
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
                getIsShow: function(data, part) {
                    return part ?
                        dataHasError(data) && !isPreviewMode(part) :
                        dataHasError(data);
                },
                getBackgroundColor: function(data) {
                    return colorCritical2;
                }
            })
        ),
    );
}
