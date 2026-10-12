function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // the shared method among shape templates
    var makeAddButton = go.go.PadCustomizationShared.makeAddButton;
    var isEditMode = go.go.PadCustomizationShared.isEditMode;
    var isPreviewMode = go.go.PadCustomizationShared.isPreviewMode;
    var isReadOnlyMode = go.go.PadCustomizationShared.isReadOnlyMode;
    var makeEvaluationPointButton = go.go.PadCustomizationShared.makeEvaluationPointButton;
    var PAD__OPEN_DEFERRED_VARIANT_MODAL =
        'PAD#OPEN_DEFERRED_VARIANT_MODAL';

    var BOUNDING_BOX_EXTRA_HEIGHT = 72;
    var BOUNDING_BOX_EXTRA_WIDTH = 60;
    var NODE_WIDTH = 120;
    var NODE_PROGRESS_GAP = 8;

    var MAIN_NODE_SHAPE_NAME = "MAIN_NODE_SHAPE";
    var BG_DOUBLE_NODE_SHAPE_NAME = "BG_DOUBLE_NODE_SHAPE";
    var FG_DOUBLE_NODE_SHAPE_NAME = "FG_DOUBLE_NODE_SHAPE";

    var NODE_SIZE = 64;
    var PORT_SIZE = 12;
    var PORT_DOT_DIAMETER = 4;
    var ADD_BUTTON_SIZE = 16;
    var PORT_ADD_BUTTON_GAP = 6;

    var defaultNodeFill = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_YELLOW0);
    var defaultNodeBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_YELLOW2);
    var defaultNodeFillWithExpType = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_BLUE0);
    var defaultNodeBorderColorWithExpType = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_BLUE1);

    var COLOR_NEUTRAL_19 = go.go.PadCustomizationShared.COLORS.NEUTRAL19;
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY2);
    var colorSelectionPrimary2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SELECTION_PRIMARY2);
    var colorPrimaryText = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.TEXT_PRIMARY);
    var colorNeutral0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL0);
    var colorNeutral8 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL8);
    var colorNeutral19 = resolveThemeVariable(COLOR_NEUTRAL_19);
    var colorCritical2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.CRITICAL2);
    var colorAlertHigh2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH2);
    var colorSurfaceBrand1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BRAND1);
    var colorGroupedPurple0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PURPLE0);
    var colorGroupedPurple1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PURPLE1);
    var colorGroupedPurple4 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PURPLE4);
    var nodeShadowColor = "rgba(" + resolveThemeVariable(COLOR_NEUTRAL_19, false) + ", 0.2)";
    var placeholderFillColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BACKGROUND_PRIMARY);
    var placeholderBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_TERTIARY);
    var iconsPlaceholderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BACKGROUND_PRIMARY);
    var colorGroupedGray1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GRAY1);
    var colorGroupedGreen0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GREEN0);
    var colorGroupedGreen4 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.GREEN4);
    var aiAgentActivityBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SECONDARY_BRAND11);
    var aiAgentMainColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SECONDARY_BRAND4);
    var aiAgentSupplementaryColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SUPPLEMENTARY_BRAND4);
    var goBackCloneBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_QUALITATIVE_5);
	var aiAgentActivityBackgroundColor = new go.Brush("Linear", {
		start: go.Spot.TopLeft,
		end: go.Spot.BottomRight,
		colorStops: new go.Map([
			{ key: 0, value: aiAgentMainColor },
			{ key: 1, value: aiAgentSupplementaryColor }
		])
	});

    var ERROR_TEXT_BLOCK = 'ERROR_TEXT_BLOCK';
    var OUTER_PORT_CIRCLE = 'OUTER_PORT_CIRCLE';
    var INNER_PORT_CIRCLE = 'INNER_PORT_CIRCLE';
    var INCOMING_DANGLE_INDICATOR = 'INCOMING_DANGLE_INDICATOR';
    var OUTGOING_DANGLE_INDICATOR = 'OUTGOING_DANGLE_INDICATOR';
    var ADD_BUTTON_LEFT = 'ADD_BUTTON_LEFT';
    var ADD_BUTTON_RIGHT = 'ADD_BUTTON_RIGHT';

    var OUTGOING_PORT_ALIGNMENT = new go.Spot(
        0,
        0,
        BOUNDING_BOX_EXTRA_WIDTH / 2 + NODE_SIZE + 1,
        BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE / 2
    );

    var ACTIVITY_NODE_TYPE_EXPERIENCE = 'experience';
    var ACTIVITY_NODE_TYPE_DECISION = 'decision';
    var ACTIVITY_NODE_TYPE_PLAYBOOK = 'playbook';
    var ACTIVITY_NODE_TYPE_PLACEHOLDER = 'placeholder';
    var ACTIVITY_NODE_TYPE_DEFAULT = 'default';
    var ACTIVITY_NODE_TYPE_AI_AGENT = 'ai_agent';
    var ACTIVITY_NODE_TYPE_AI_SKILL = 'ai_skill';
    var ACTIVITY_NODE_TYPE_GO_BACK = 'go_back';

    var GO_BACK_TO_NODE_WIDTH = 56;
    var GO_BACK_FROM_NODE_WIDTH = 75;
    var GO_BACK_NODE_HEIGHT = 22;
    var goBackFillColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.ALERT_MODERATE_0);
    var goBackBorderColor = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.ALERT_MODERATE_2);
    var goBackCloneFillColor = colorNeutral0;

    function isGoBackNode(activityNodeType) {
        return activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK;
    }
    function isGoBackCloneNode(data) {
        return data && data.activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK && data.isGoBackClone === true;
    }
    function isGoBackMainNode(data) {
        return data && data.activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK && data.isGoBackClone !== true;
    }
    function getGoBackCloneNodeWidth(data) {
        return data && data.key && data.key.endsWith('_go_back_from')
            ? GO_BACK_FROM_NODE_WIDTH : GO_BACK_TO_NODE_WIDTH;
    }
    function getEffectiveNodeWidth(activityNodeType, data) {
        return isGoBackCloneNode(data) ? getGoBackCloneNodeWidth(data) : NODE_SIZE;
    }
    function getEffectiveNodeHeight(activityNodeType, data) {
        return isGoBackCloneNode(data) ? GO_BACK_NODE_HEIGHT : NODE_SIZE;
    }

    var RESTART_RULE_RUN_ONLY_ONCE = 'RUN_ONLY_ONCE';

    var buildChildShapeTemplate = shapeTemplateUtilities.buildChildShapeTemplate; // Function to build child shape templates
    var children = shapeTemplateUtilities.children; // Array of children shape templates

    function makeIconContainer({
        icon,
        getIsShow,
        margin
    }) {
        if (typeof getIsShow !== 'function')
            getIsShow = function() {
                return false;
            };

        var backgroundShapeConfig = {
            strokeWidth: 1,
            parameter1: 2,
            width: 90,
            height: 22
        };

        return $(
            go.Panel,
            "Spot", {
                margin: margin || new go.Margin(0, 2, 0, 2),
            },
            new go.Binding("visible", "", function(data) {
                return getIsShow(data);
            }),
            $(
                go.Shape,
                "RoundedRectangle", {
                    stroke: placeholderBorderColor
                },
                backgroundShapeConfig,
                new go.Binding("fill", "",
                    function(data) {
                        return getIsShow(data) ?
                            data.shouldFillGray && !isShowOverride(data) ?
                            colorGroupedGray1 :
                            iconsPlaceholderColor :
                            'transparent';
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
                    }
                }),
                makeIconWithBackground({
                    icon: makeIcon({
                        source: 'icon',
                        objectSource: 'aiAgentActive'
                    }),
                    toolTip: makeTooltip({
                        textSource: 'aiAgentActive',
                        getTooltipText: function(textSourceValue) {
                            return textSourceValue?.rule?.displayValue;
                        }
                    }),
                    getIsShow: function(data) {
                        return isAiAgentEnabled(data);
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
                    }
                }),
                makeIconWithBackground({
                    icon: makeIcon({
                        source: 'icon',
                        objectSource: 'variant'
                    }),
                    toolTip: makeTooltip({
                        textSource: 'variant',
                        getTooltipText: function(textSourceValue) {
                            return textSourceValue?.rule?.displayValue;
                        }
                    }),
                    getIsShow: function(data) {
                        return isShowVariant(data);
                    }
                }),
                makeIconWithBackground({
                    icon: makeIcon({
                        source: 'icon',
                        objectSource: 'override'
                    }),
                    toolTip: makeTooltip({
                        textSource: 'override',
                        getTooltipText: function(textSourceValue) {
                            return textSourceValue?.rule?.displayValue;
                        }
                    }),
                    getIsShow: function(data) {
                        return isShowOverride(data);
                    }
                })
            )
        );
    }


    function makePort(portId, name, spot, alignment, alignmentFocus, output, input, fromLinkableBinding, toLinkableBinding) {
        var args = [{
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
        }];
        if (fromLinkableBinding) args.push(fromLinkableBinding);
        if (toLinkableBinding) args.push(toLinkableBinding);
        return $.apply($, [go.Shape, "Circle"].concat(args));
    }

    function makeIcon({
        source,
        objectSource,
        addlProps,
        fillOverride,
        bindSource
    }) {
        var bindingSourceProp = (bindSource !== undefined) ? bindSource : '';
        return $(
            go.Shape,
            new go.Binding("geometry", bindingSourceProp, function(dataOrValue) {
                var iconSVG = (bindSource !== undefined)
                    ? dataOrValue
                    : (objectSource ? dataOrValue[objectSource]?.[source] : dataOrValue[source]);

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
                        if (fillRule === 'evenodd' || !fillRule) {
                            if (objectSource === 'override')
                                geometryString = geometryString.concat('F0 M0 0');
                            else
                                geometryString = geometryString.concat('F0');
                        }

                        geometryString = geometryString.concat(pathD);
                    }
                }
                var geo = go.Geometry.parse(geometryString);
                geo.normalize();
                return geo;
            }),
            fillOverride ? { fill: fillOverride } :
            new go.Binding("fill", "", function(data) {
                return !data.shouldFillGray && dataHasError(data) && objectSource === 'errors' ?
                    resolveThemeVariable(data?.errors?.iconColor) : objectSource === 'aiAgentActive' ?
                    resolveThemeVariable(data?.aiAgentActive?.iconColor) : colorPrimaryText;
            }),

            {
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
            "Button", {
                margin: margin || new go.Margin(0, 2, 0, 2),
                "ButtonBorder.stroke": null, // Removes the border color
                "ButtonBorder.fill": null, // Removes the background color
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
                    return getIsShow(data) ?
                        getBackgroundColor(data) :
                        'transparent';
                }),
                new go.Binding("stroke", "", function(data) {
                    return getIsShow(data) ?
                        getBorderColor(data) :
                        'transparent';
                }),
            ),
            icon
        );
    }
    /**
     * Creates tooltip for text based source object
     * @param {String} args.textSource - Source object name to attach tooltip to
     * @param {String} [args.textBlockName] - Name of the textblock whose text needs to be
     *      checked for truncation
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
            width: PORT_SIZE,
            height: PORT_SIZE,
            fill: colorPrimary1,
            stroke: colorPrimary1,
            segmentIndex: 0,
        });
    }

    function renderPort(showPort) {
        if (showPort) {
            return $(
                go.Panel,
                "Table",
                new go.Binding("mouseEnter", "", function(adornment) {
                    return function(e, obj) {
                        if (!isEditMode(e)) return;

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
                }).ofObject(), {
                    alignment: OUTGOING_PORT_ALIGNMENT,
                    alignmentFocus: go.Spot.Center,
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
                        if (part.data.hasOutgoing) {
                            if (part.adornedPart.isSelected && isEditMode(part)) {
                                return colorPrimary1;
                            } else if (part.data.color) {
                                return go.Brush.darkenBy(part.data.color, 0.4);
                            } else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_PLACEHOLDER) {
                                return placeholderBorderColor;
                            } else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_EXPERIENCE) {
                                return defaultNodeBorderColorWithExpType;
                            } else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_AI_AGENT ||
                                       part.data.activityNodeType === ACTIVITY_NODE_TYPE_AI_SKILL) {
                                return aiAgentActivityBorderColor;
                            } else {
                                return defaultNodeBorderColor;
                            }
                        } else {
                            return colorAlertHigh2;
                        }
                    }).ofObject(),
                    new go.Binding("strokeWidth", "", function(part) {
                        return part.adornedPart.isSelected && part.data.hasOutgoing && isEditMode(part) ?
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
                    "Circle",
                    new go.Binding("fill", "hasOutgoing", function(hasOutgoing) {
                        return hasOutgoing ? colorPrimary1 : colorAlertHigh2;
                    }), {
                        name: INNER_PORT_CIRCLE,
                        strokeWidth: 0,
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

    function leftPortDisabled(data) {
        return data.leftPortDisabled;
    }

    function formNodeHoverAdornment(node, showPort) {
        var rightAddButtonAlignment = new go.Spot(
            0,
            0,
            node?.deferredVariantEvaluationPoint?.showEvaluationPoint ?
            BOUNDING_BOX_EXTRA_WIDTH / 2 + NODE_SIZE + (PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP) + 40 + PORT_ADD_BUTTON_GAP :
            BOUNDING_BOX_EXTRA_WIDTH / 2 + NODE_SIZE + (PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP + 2),
            BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE / 2
        );
        var args = [
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
            renderPort(showPort)
        ];
        args.push(makeAddButton(
            $,
            go,
            dispatch,
            resolveThemeVariable, {
                name: ADD_BUTTON_LEFT,
                label: "+",
                alignment: new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2 - (PORT_SIZE / 2 + PORT_ADD_BUTTON_GAP), BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE / 2),
                alignmentFocus: go.Spot.Right,
                mode: "standard",
                disableCondition: leftPortDisabled,
                clickHandler: function(e, btn) {
                    if (!isEditMode(btn)) return;

                    dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                        type: "picker",
                        position: btn.getDocumentPoint(go.Spot.Center),
                        nodeData: btn.part.data,
                        nodeContext: 'addLeft'
                    });
                }
            }
        ));
        if (!isGoBackMainNode(node)) {
            args.push(makeAddButton(
                $,
                go,
                dispatch,
                resolveThemeVariable, {
                    name: ADD_BUTTON_RIGHT,
                    label: "+",
                    alignment: rightAddButtonAlignment,
                    alignmentFocus: go.Spot.Left,
                    mode: "standard",
                    clickHandler: function(e, btn) {
                        if (!isEditMode(btn)) return;

                        var data = btn.part.data;
                        var nodeContext = 'addRight';
                        if (data.activityNodeType === ACTIVITY_NODE_TYPE_DECISION)
                            nodeContext = 'addRightDecision';
                        dispatch("PAD#DIAGRAM_OPEN_BUTTON_TRAY", {
                            type: "picker",
                            position: btn.getDocumentPoint(go.Spot.Center),
                            nodeData: data,
                            nodeContext
                        });
                    }
                }
            ));
        }
        return $.apply($, args);
    }

    function showAdornmentWithPort(node) {
        if (node) {
            if (node.data.activityNodeType === ACTIVITY_NODE_TYPE_DECISION)
                return false;

            var linksOutOf = node.findLinksOutOf();
            if (linksOutOf) {
                return !linksOutOf.any(function(link) {
                    return link.isSelected;
                });
            }
        }
        return true;
    }

    function getFillColor(data) {
        if (data.colorCategory)
            return resolveThemeVariable(data.colorCategory);
        else if (data.activityNodeType === ACTIVITY_NODE_TYPE_PLACEHOLDER)
            return placeholderFillColor;
        else if (data.color)
            return data.color;
        else if (data.activityNodeType === ACTIVITY_NODE_TYPE_EXPERIENCE)
            return defaultNodeFillWithExpType;
        else if (data.activityNodeType === ACTIVITY_NODE_TYPE_AI_AGENT ||
                 data.activityNodeType === ACTIVITY_NODE_TYPE_AI_SKILL)
            return aiAgentActivityBackgroundColor;
        else if (data.activityNodeType === ACTIVITY_NODE_TYPE_DECISION)
            return colorGroupedPurple1;
        else if (isGoBackCloneNode(data))
            return goBackCloneFillColor;
        else if (isGoBackMainNode(data))
            return goBackFillColor;
        else
            return defaultNodeFill;
    }

    function getStrokeColor(part) {
        if (part.isSelected && !isPreviewMode(part))
            return colorSelectionPrimary2;
        else if (dataHasError(part.data))
            return resolveThemeVariable(part.data?.errors?.borderColor);
        else if (part.data.borderColor)
            return resolveThemeVariable(part.data.borderColor);
        else if (part.data.color)
            return go.Brush.darkenBy(part.data.color, .4);
        else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_PLACEHOLDER)
            return placeholderBorderColor;
        else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_EXPERIENCE)
            return defaultNodeBorderColorWithExpType;
        else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_AI_AGENT ||
                 part.data.activityNodeType === ACTIVITY_NODE_TYPE_AI_SKILL)
            return aiAgentActivityBorderColor;
        else if (part.data.activityNodeType === ACTIVITY_NODE_TYPE_DECISION)
            return colorGroupedPurple4;
        else if (isGoBackCloneNode(part.data))
            return goBackCloneBorderColor;
        else if (isGoBackMainNode(part.data))
            return goBackBorderColor;
        else
            return defaultNodeBorderColor;
    }

    // Highlights or restores all visual elements of a Go Back path:
    // the main node's clone nodes and the three path edges.
    // Called on hover enter/leave of any Go Back node or edge.
    function applyGoBackPathHover(diagram, goBackSysId, isHover) {
        var pathHoverColor = goBackCloneBorderColor; // qualitative-5 purple for edges and clone nodes
        var toCloneKey = goBackSysId + '_go_back_to';
        var fromCloneKey = goBackSysId + '_go_back_from';
        var pathNodeKeys = {};
        pathNodeKeys[goBackSysId] = true;
        pathNodeKeys[toCloneKey] = true;
        pathNodeKeys[fromCloneKey] = true;

        // Update clone node borders
        [toCloneKey, fromCloneKey].forEach(function(key) {
            var n = diagram.findNodeForKey(key);
            if (!n) return;
            var shape = n.findObject(MAIN_NODE_SHAPE_NAME);
            if (shape) shape.stroke = isHover ? pathHoverColor : goBackCloneBorderColor;
        });

        // Update path link colors, dash arrays, and bridge opacity
        diagram.links.each(function(link) {
            if (!link.data) return;
            if (!(link.data.isGoBackEdge || link.data.isGoBackTargetEdge)) return;
            if (!pathNodeKeys[link.data.from] && !pathNodeKeys[link.data.to]) return;
            var linkPath = link.findObject('LinkPath');
            var arrowhead = link.findObject('LinkArrowhead');
            if (linkPath) {
                linkPath.stroke = isHover ? pathHoverColor : goBackCloneBorderColor;
                if (!link.data.isGoBackBridgeEdge)
                    linkPath.strokeDashArray = isHover ? null : [6, 4];
            }
            if (arrowhead) arrowhead.fill = isHover ? pathHoverColor : goBackCloneBorderColor;
            if (link.data.isGoBackBridgeEdge) link.opacity = isHover ? 1.0 : 0.1;
        });
    }

    function handleMouseEnterAndHover(data) {
        return function(e, node) {
            var shape = node.findObject(MAIN_NODE_SHAPE_NAME);
            if (data.shouldFillGray && !data.hasParentError && !node.isSelected && !data.isLaneLevel) {
                shape.fill = getFillColor(data);
                shape.stroke = getStrokeColor(node);
            }
            if (isPreviewMode(e)) {
                shape.stroke = colorPrimary1;
                node.isSelected = true;
                dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED_VIEW_ONLY", {
                    node: node,
                    diagram: e.diagram,
                    highlight: true
                });
            } else if (isReadOnlyMode(e)) {
                node.isShadowed = true;
            } else {
                var nodeHoverAdornment = isGoBackCloneNode(data)
                    ? null
                    : formNodeHoverAdornment(data, showAdornmentWithPort(node));
                dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                    node: node,
                    diagram: e.diagram,
                    adornment: nodeHoverAdornment,
                    highlight: true
                });
            }
            if (isGoBackNode(data.activityNodeType)) {
                var goBackSysId = isGoBackCloneNode(data) ? data.goBackActivitySysId : data.key;
                applyGoBackPathHover(e.diagram, goBackSysId, true);
            }
        };
    }

    /**
     * Creates shapes for concentric circle indicator
     * @param args - Object containing name, alignment, color (for stroke and fill), and visibilityFunc
     * @returns GoJS Panel
     */
    function makeDanglingIndicator(args) {
        var panel = $(go.Panel, "Table", new go.Binding("visible", "", args.visibilityFunc), {
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
                desiredSize: new go.Size(PORT_DOT_DIAMETER, PORT_DOT_DIAMETER)
            }));
        if (args.alignmentBinding) {
            panel.bind(args.alignmentBinding);
        }
        return panel;
    }

    function makeNodeShape(args) {
        return $(go.Shape, new go.Binding("figure", "", function(data) {
                if (data.activityNodeType === ACTIVITY_NODE_TYPE_EXPERIENCE ||
                    data.activityNodeType === ACTIVITY_NODE_TYPE_PLAYBOOK ||
                    data.activityNodeType === ACTIVITY_NODE_TYPE_PLACEHOLDER ||
                    data.activityNodeType === ACTIVITY_NODE_TYPE_AI_AGENT ||
                    data.activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK)
                    return "RoundedRectangle";
                else if (data.activityNodeType === ACTIVITY_NODE_TYPE_DECISION)
                    return "RoundedDiamond";
                else
                    return "Circle";
            }),
            new go.Binding("desiredSize", "", function(data) {
                if (isGoBackCloneNode(data))
                    return new go.Size(getGoBackCloneNodeWidth(data), GO_BACK_NODE_HEIGHT);
                return new go.Size(NODE_SIZE, NODE_SIZE);
            }),
            new go.Binding("name", "", function(part) {
                // When the background double is visible, we want it to be named MAIN_NODE_SHAPE so that any targeting will take into account the extra space the background double takes
                // When it's not visible, make sure the name is not MAIN_NODE_SHAPE so that any targeting will not take it into account
                if (args.isBackgroundDouble) {
                    if (part.activityNodeType === ACTIVITY_NODE_TYPE_PLAYBOOK)
                        return MAIN_NODE_SHAPE_NAME;
                    else
                        return BG_DOUBLE_NODE_SHAPE_NAME;
                } else {
                    // Playbook node main body is the background, so make the foreground shape a different name
                    if (part.activityNodeType === ACTIVITY_NODE_TYPE_PLAYBOOK)
                        return FG_DOUBLE_NODE_SHAPE_NAME;
                    else
                        return MAIN_NODE_SHAPE_NAME;
                }
            }),
            new go.Binding("visible", "", function(part) {
                return !args.isBackgroundDouble ||
                    // If this is for the background double, it's only visible for playbook nodes
                    part.activityNodeType === ACTIVITY_NODE_TYPE_PLAYBOOK;
            }),
            new go.Binding("fill", "", function(part) {
                if (part.data.shouldFillGray && !part.isSelected || (part.data.shouldFillGray && part.data.isLaneLevel))
                    return colorGroupedGray1;
                return getFillColor(part.data);
            }).ofObject(),
            new go.Binding("stroke", "", function(part) {
                if (part.data.shouldFillGray && !part.isSelected && !isShowOverride(part.data))
                    return colorNeutral8;
                return getStrokeColor(part);
            }).ofObject(),
            new go.Binding("strokeWidth", "", function(part) {
                if (part.data.doesActivityNeedBorderColor && !((part.isSelected && !isPreviewMode(part)) || dataHasError(part?.data)))
                    return 4;
                else
                    return 2;
            }).ofObject(),
            new go.Binding("strokeDashArray", '', function(part) {
                if (!part.isSelected && part.data.incompleteActivity)
                    return [4, 5];
            }).ofObject(), {
                position: args.isBackgroundDouble ? new go.Point(8, -8) : new go.Point(0, 0)
            }
        );
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

    function dataHasError(data) {
        return !!data?.errors?.hasErrors;
    }

    function isShowRestartRule(data) {
        return (
            !!data?.restart?.rule?.value &&
            data.restart.rule.value !== RESTART_RULE_RUN_ONLY_ONCE
        );
    }

    function isAiAgentEnabled(data) {
        return !!data?.aiAgentActive?.rule?.value;
    }

    function isShowVariant(data) {
        return (
            data?.variant?.showVariant
        );
    }

    function isShowOverride(data) {
        return (
            data?.override?.showOverride
        );
    }

    function isShowIcons(data) {
        return (isShowRestartRule(data) || isShowVariant(data) || dataHasError(data) || isShowOverride(data) || isAiAgentEnabled(data));
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
        "Spot",
        new go.Binding("isLayoutPositioned", "isLayoutPositioned", function(val) { return val !== false; }),
        new go.Binding("opacity", "isHidden", function(isHidden) {
            return isHidden === true ? 0.0 : 1.0;
        }),
        new go.Binding("cursor", '', function(data, model) {
            return data && (data.isHidden || isPreviewMode(model)) === true ? "default" : "pointer";
        }),
        new go.Binding('selectable', '', function(data, model) {
            // Loopback clone nodes must never be selectable: their unusual lifecycle
            // (removed from lane group via positionLoopbackNodes) leaves GoJS internal
            // state inconsistent, causing a crash in the isSelected setter chain when
            // selection is cleared during a related node deletion. Clicks are still
            // handled via the explicit click handler below.
            return !data.isHidden && !data.hasParentError && !isGoBackCloneNode(data);
        }),
        new go.Binding('mouseEnter', '', handleMouseEnterAndHover),
        new go.Binding('mouseHover', '', handleMouseEnterAndHover),
        new go.Binding('mouseLeave', '', function(data) {
            return function(e, node, next) {
                var shape = node.findObject(MAIN_NODE_SHAPE_NAME);
                if (isPreviewMode(e)) {
                    shape.stroke = null;
                    node.isSelected = false;
                    dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED_VIEW_ONLY", {
                        node: node,
                        diagram: e.diagram,
                        highlight: false
                    });
                    return;
                }
                if (isReadOnlyMode(e)) {
                    node.isShadowed = false;
                    return;
                }
                if (data.shouldFillGray && !node.isSelected) {
                    shape.fill = colorGroupedGray1;
                    shape.stroke = colorNeutral8;
                }
                if (leaveNode(node, next)) {
                    dispatch("PAD#DIAGRAM_NODE_HIGHLIGHTED", {
                        node: node,
                        diagram: e.diagram,
                        highlight: false
                    });
                    if (isGoBackNode(data.activityNodeType)) {
                        var goBackSysId = isGoBackCloneNode(data) ? data.goBackActivitySysId : data.key;
                        applyGoBackPathHover(e.diagram, goBackSysId, false);
                    }
                }
            };
        }), {
            name: "ActivityNode",
            layerName: "Foreground",
            selectionAdorned: false,
            isShadowed: false,
            shadowColor: nodeShadowColor,
            shadowOffset: new go.Point(0, 4),
            shadowBlur: 8,
            margin: 0,
            minLocation: new go.Point(NaN, -Infinity),
            maxLocation: new go.Point(NaN, Infinity),
            mouseHold: function(e, node) {
                if (isPreviewMode(e)) return;

                node.isShadowed = false;
                var shape = node.findObject(MAIN_NODE_SHAPE_NAME);
                shape.strokeDashArray = null;
                shape.stroke = colorPrimary1;
            },
            // Loopback clone nodes are non-selectable (see selectable binding), so GoJS
            // won't dispatch the normal NODE_SELECTED action for them. This click handler
            // replicates that dispatch so clicking a loopback clone still opens the
            // corresponding Go Back activity panel.
            click: function(e, node) {
                if (!isGoBackNode(node.data && node.data.activityNodeType)) return;
                dispatch('PAD#DIAGRAM_NODE_SELECTION', {
                    key: node.data.key,
                    hasParentError: node.data.hasParentError
                });
            },
        },
        $(
            go.Panel,
            go.Panel.Position,
            $(go.Shape, "RoundedRectangle",
                new go.Binding("position", "isSelected", function(isSelected) {
                    // When the node is selected, the extra stroke width nudges it down and right a little
                    // The extra 0.5 nudges it back up and left back to the center
                    return isSelected ? new go.Point(
                            -(BOUNDING_BOX_EXTRA_WIDTH / 2 - 0.5),
                            -(BOUNDING_BOX_EXTRA_HEIGHT / 2 - 0.5)
                        ) :
                        new go.Point(
                            -(BOUNDING_BOX_EXTRA_WIDTH / 2),
                            -(BOUNDING_BOX_EXTRA_HEIGHT / 2)
                        );
                }).ofObject(),
                new go.Binding("width", "", function(data) {
                    return getEffectiveNodeWidth(data.activityNodeType, data) + BOUNDING_BOX_EXTRA_WIDTH;
                }),
                new go.Binding("height", "", function(data) {
                    return getEffectiveNodeHeight(data.activityNodeType, data) + BOUNDING_BOX_EXTRA_HEIGHT;
                }), {
                    fill: "transparent",
                    width: NODE_SIZE + BOUNDING_BOX_EXTRA_WIDTH,
                    height: NODE_SIZE + BOUNDING_BOX_EXTRA_HEIGHT,
                    stroke: null,
                }),
            makeNodeShape({
                isBackgroundDouble: true
            }),
            $(go.Panel, "Spot",
                makeNodeShape({}),
                $(go.Panel, "Horizontal",
                    new go.Binding("visible", "", function(data) {
                        return isGoBackCloneNode(data);
                    }), {
                        alignment: go.Spot.Center
                    },
                    makeIcon({
                        source: 'nodeIcon',
                        fillOverride: goBackCloneBorderColor,
                        bindSource: 'nodeIcon',
                        addlProps: {
                            desiredSize: new go.Size(12, 12),
                            margin: new go.Margin(0, 4, 0, 0)
                        }
                    }),
                    $(go.TextBlock,
                        new go.Binding("text", "goBackText"), {
                            font: "600 11px SourceSansPro, sans-serif",
                            stroke: goBackCloneBorderColor,
                            verticalAlignment: go.Spot.Center
                        }
                    )
                ),
                $(go.Panel, "Auto",
                    new go.Binding("visible", "", function(data) {
                        return isGoBackMainNode(data);
                    }),
                    makeIcon({
                        source: 'nodeIcon',
                        addlProps: {
                            shadowVisible: false,
                            pickable: false,
                            desiredSize: new go.Size(24, 24)
                        }
                    })
                ),
                $(go.Panel, "Auto",
                    new go.Binding("visible", "", function(data) {
                        return !isGoBackNode(data.activityNodeType);
                    }),
                    makeIcon({
                        source: 'nodeIcon',
                        addlProps: {
                            shadowVisible: false,
                            // Used so hovering over icon does not change mouse cursor type
                            pickable: false
                        }
                    })
                )
            )
        ),
        $(go.Shape, "Rectangle", {
                height: 100,
                width: 120,
                fill: "transparent",
                strokeWidth: 0,
                stretch: go.GraphObject.Fill
            },
            new go.Binding("alignment", "", function(node) {
                const showEvaluationPoint = node?.deferredVariantEvaluationPoint?.showEvaluationPoint;
                return new go.Spot(1, 1,
                    showEvaluationPoint ? (-BOUNDING_BOX_EXTRA_WIDTH / 2 + PORT_ADD_BUTTON_GAP + 36) : -BOUNDING_BOX_EXTRA_WIDTH,
                    NODE_PROGRESS_GAP - 40
                );
            })
        ),
        $(
            go.TextBlock,
            new go.Binding("visible", "", function(data) {
                return !isGoBackCloneNode(data);
            }),
            new go.Binding("stroke", "", function(part) {
                return colorPrimaryText;
            }).ofObject(),
            new go.Binding("text").makeTwoWay(),
            new go.Binding("font", "labelFont"),
            new go.Binding("alignment", "", function(data) {
                var w = getEffectiveNodeWidth(data.activityNodeType, data);
                var h = getEffectiveNodeHeight(data.activityNodeType, data);
                return new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2 + w / 2, BOUNDING_BOX_EXTRA_HEIGHT / 2 + h + 4);
            }), {
                name: "activityName",
                textAlign: "center",
                overflow: go.TextBlock.OverflowEllipsis,
                maxLines: 2,
                alignment: new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2 + NODE_SIZE / 2, BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE + 4),
                alignmentFocus: go.Spot.TopCenter,
                width: NODE_WIDTH,
                height: 32,
                margin: 0,
                shadowVisible: false,
                // Below are undocumented properties, used to adjust the spacing between lines
                spacingAbove: 1,
                editable: false,
                background: "transparent",
                toolTip: getTooltipForText({
                    textSource: "text",
                    textBlockName: "activityName",
                })
            }
        ),
        $(
            go.Panel,
            "Horizontal", {
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.TopCenter
            },
            makeIconContainer({
                getIsShow: function(data) {
                    return isShowIcons(data);
                }
            })
        ),
        makeDanglingIndicator({
            name: INCOMING_DANGLE_INDICATOR,
            alignment: new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2 + 1, BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE / 2),
            color: colorCritical2,
            visibilityFunc: function(data) {
                return !data.hasIncoming && !data.leftPortDisabled && !isGoBackNode(data.activityNodeType);
            },
            alignmentBinding: new go.Binding("alignment", "", function(data) {
                return new go.Spot(0, 0, BOUNDING_BOX_EXTRA_WIDTH / 2 + 1, BOUNDING_BOX_EXTRA_HEIGHT / 2 + getEffectiveNodeHeight(data.activityNodeType, data) / 2);
            })
        }),
        makeDanglingIndicator({
            name: OUTGOING_DANGLE_INDICATOR,
            alignment: OUTGOING_PORT_ALIGNMENT,
            color: colorAlertHigh2,
            visibilityFunc: function(data) {
                return !data.hasOutgoing && data.activityNodeType !== ACTIVITY_NODE_TYPE_GO_BACK;
            }
        }),
        makeEvaluationPointButton(
            $,
            go,
            dispatch,
            resolveThemeVariable, {
                name: 'EVALUATION_POINT_BUTTON',
                alignment: new go.Spot(
                    0,
                    0,
                    BOUNDING_BOX_EXTRA_WIDTH + 40 + PORT_ADD_BUTTON_GAP,
                    BOUNDING_BOX_EXTRA_HEIGHT / 2 + NODE_SIZE / 2
                ),
                alignmentFocus: go.Spot.Left,
                clickHandler: function(e, btn) {
                    dispatch(PAD__OPEN_DEFERRED_VARIANT_MODAL);
                    dispatch('PAD#POPOVERS_DISMISSED');
                },
                icon: makeIcon({
                    source: 'icon',
                    objectSource: 'deferredVariantEvaluationPoint'
                }),
                isVisible: new go.Binding(
                    'visible',
                    '',
                    function(data) {
                        return !isGoBackNode(data.activityNodeType) && !!(data.deferredVariantEvaluationPoint && data.deferredVariantEvaluationPoint.showEvaluationPoint);
                    }
                )
            }
        ),
        makePort(
            "c0bed67c535c20100b0cddeeff7b12fc",
            "PORT_LEFT",
            go.Spot.Left,
            new go.Spot(0, 0.5),
            new go.Spot(0.5, 1, -BOUNDING_BOX_EXTRA_WIDTH / 2, 0),
            false,
            true,
            new go.Binding("fromLinkable", "activityNodeType", function(type) { return false; }),
            // Loopback "to" nodes use PORT_RIGHT as the incoming connection point
            // (matching the toPort used in createObjectsToAddForOutgoing), so
            // PORT_LEFT must not accept drops for them.
            new go.Binding("toLinkable", "activityNodeType", function(type) { return !isGoBackNode(type); })
        ),
        makePort(
            "49de92bc535c20100b0cddeeff7b12f9",
            "PORT_RIGHT",
            go.Spot.Right,
            new go.Spot(1, 0.5),
            new go.Spot(0.5, 1, BOUNDING_BOX_EXTRA_WIDTH / 2, 0),
            true,
            false,
            new go.Binding("fromLinkable", "activityNodeType", function(type) { return !isGoBackNode(type); }),
            // Loopback "to" nodes receive their predecessor edge on PORT_RIGHT,
            // so allow drops here for them (all other nodes keep toLinkable false).
            new go.Binding("toLinkable", "activityNodeType", function(type) { return isGoBackNode(type); })
        ),
        $(go.Panel, "Spot",
            new go.Binding("alignment", "", function(data) {
                return new go.Spot(0.5, 0, 0, getEffectiveNodeHeight(data.activityNodeType, data) / 2 - NODE_PROGRESS_GAP);
            }), {
                alignment: new go.Spot(0.5, 0, 0, NODE_SIZE / 2 - NODE_PROGRESS_GAP),
            },
            // Building the loading child template
            buildChildShapeTemplate(children[0], {}),
        )
    );
}
