function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    // consistent with process-designer-configuration.constants.js's ENABLE_FEATURES.STAGES
    var PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES = 'stages';
    var isEditMode = go.go.PadCustomizationShared.isEditMode;
    var isPreviewMode = go.go.PadCustomizationShared.isPreviewMode;

    var colorWhite = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.NEUTRAL1);
    var colorBorderPrimary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_PRIMARY);
    var colorBorderSecondary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_SECONDARY);
    var colorBorderTertiary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_TERTIARY);
    var colorBorderTertiaryActionable = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BORDER_TERTIARY_ACTIONABLE);
    var colorBackgroundTertiary = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.BACKGROUND_TERTIARY);
    var colorPrimary0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY0);
    var colorPrimary1 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PRIMARY1);
    var colorSecondary0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.SECONDARY0);
    var colorFocus2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.FOCUS2);
    var colorAlertHigh0 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH0);
    var colorAlertHigh2 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.HIGH2);
    var colorGroupedPurple4 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.PURPLE4);
    var colorQualitative5 = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.DATAVIS_QUALITATIVE_5);
    var colorIdealPath = resolveThemeVariable(go.go.PadCustomizationShared.COLORS.ORANGE2);

    var END_SEGMENT_LENGTH = 40;
    var PORT_OUTER_SIZE = 18.5;
    var PORT_SIZE = 12;
    var HIGHLIGHT_WIDTH = 14;
    var ORIENTATION_VERTICAL = 'VERTICAL';
    var ORIENTATION_HORIZONTAL = 'HORIZONTAL';
    var TOOLBAR_TYPE_CONNECTOR = 'connectorToolbar';
    var BUTTON_TRAY_HEIGHT = 24;
    var POPOVER_VERTICAL_OFFSET = BUTTON_TRAY_HEIGHT / 2;
    var POPOVER_CLOSENESS_OFFSET = 4;
    var LINK_PATH = "LinkPath";
    var LINK_ARROWHEAD = "LinkArrowhead";
    var LINK_HIGHLIGHT = "LinkHighlight";
    var LINK_ADORNMENT_PATH = "LinkAdornmentPath";
    var LINK_ADORNMENT_ARROWHEAD = "LinkAdornmentArrowhead";
    var LINK_ADORNMENT_HIGHLIGHT = "LinkAdornmentHighlight";
    var LINK_LABEL = "LinkLabel";

    // if drawLinkTo is true, the start point of the link is dragged;
    // else, the end point of the link is dragged.
    function drawLink(e, obj, drawLinkTo) {
        var edge = obj.part.adornedPart;
        var tool = e.diagram.toolManager.relinkingTool;
        tool.originalLink = edge;
        tool.isForwards = !drawLinkTo;
        if (drawLinkTo) {
            tool.temporaryFromNode.location = e.diagram.lastInput.documentPoint;
        } else {
            tool.temporaryToNode.location = e.diagram.lastInput.documentPoint;
        }
        e.diagram.currentTool = tool;
        tool.doActivate();
        tool.temporaryFromNode.ensureBounds();
        tool.temporaryToNode.ensureBounds();

        if (drawLinkTo) {
            tool.temporaryToPort = $(go.Panel, 'Spot').add(
                $(go.Shape, 'Circle', {
                    width: PORT_OUTER_SIZE,
                    height: PORT_OUTER_SIZE,
                    fill: colorFocus2,
                    stroke: colorFocus2,
                    segmentIndex: -1,
                }),
                $(go.Shape, 'Circle', {
                    width: PORT_SIZE,
                    height: PORT_SIZE,
                    fill: colorPrimary0,
                    stroke: colorPrimary0,
                    segmentIndex: -1,
                })
            )
        } else {
            tool.temporaryFromPort = $(go.Panel, 'Spot').add(
                $(go.Shape, 'Circle', {
                    width: PORT_OUTER_SIZE,
                    height: PORT_OUTER_SIZE,
                    fill: colorFocus2,
                    stroke: colorFocus2,
                    segmentIndex: 0,
                }),
                $(go.Shape, 'Circle', {
                    width: PORT_SIZE,
                    height: PORT_SIZE,
                    fill: colorPrimary0,
                    stroke: colorPrimary0,
                    segmentIndex: 0,
                })
            );
        }
    }

    function computeHitboxesFromLinkPoints(linkPoints, linkThiccness) {
        // linkPoints must be ordered starting from the beginning of link
        // to the end of link
        linkPoints = linkPoints || [];
        var halfThiccness = linkThiccness / 2;
        var hitboxes = [];
        var cornerSquareHitBoxes = [];
        linkPoints.forEach(function(currLinkPoint, idx, linkPoints) {
            var prevLinkPoint = linkPoints[idx - 1];
            if (!prevLinkPoint)
                return;
            /*
                                       ^
                                       |
                                      top
                                       |
                                       V
            <---------- left --------> ---------------------------               ^
                                      |                           |              |
                                      |   This is a hitbox        |        halfThickness
                                      |   constructed from two    |              |
            This is a linkPoint ----> *   linkPoints, this area   * <-----       V
            with x,y coordinates      |   will be used to test    |       |
                                      |   if a random point can   |     This is a 2nd linkPoint with x,y coordiantes.
                                      |   exist here              |     If y equals the previous linkPoint (1st)'s y,
                                      |                           |     we can use this linkPoint and the previous
                                       ---------------------------      linkPoint and the thickness of the link to
                                                                        construct a new hitbox

                                                                  * <--- This is a 3rd linkPoint with x,y coordiantes.
                                                                         If x equals the previous linkPoint (2nd)'s
                                                                         x, we can construct a new hitbox with these
                                                                         two linkPoints and the thickness of the link.
                                                                         This link has turned right. If this linkPoint's
                                                                         y is smaller than previous linkPoint's y then
                                                                         we say this link has turned left.
            */
            var prevX = prevLinkPoint.x;
            var prevY = prevLinkPoint.y;
            var currX = currLinkPoint.x;
            var currY = currLinkPoint.y;
            if (currY === prevY) { // two points are horizontally aligned
                hitboxes.push({
                    top: prevY - halfThiccness,
                    left: Math.min(prevX, currX),
                    length: Math.abs(currX - prevX),
                    height: linkThiccness,
                    orientation: ORIENTATION_HORIZONTAL
                });
            } else if (currX === prevX) { // two points are vertically aligned
                /* adding a square hitbox to cover the joints
                 ---------
                |         |   <--- need to cover this corner space
                |     ----*----
                |    |    |    |
                 ---------     |
                     |         |
                      ----*----
                Or
                      ----*----
                     |         |
                 ---------     |
                |    |    |    |
                |     ----*----
                |         |   <--- need to cover this corner space
                 ---------
                */
                cornerSquareHitBoxes.push({
                    top: prevY - halfThiccness,
                    left: prevX - halfThiccness,
                    length: linkThiccness,
                    height: linkThiccness,
                    orientation: ORIENTATION_VERTICAL
                });
                if (currY > prevY) {
                    // link turns right
                    hitboxes.push({
                        top: prevY,
                        left: prevX - halfThiccness,
                        length: currY - prevY,
                        height: linkThiccness,
                        orientation: ORIENTATION_VERTICAL
                    });
                } else {
                    // link turns left
                    hitboxes.push({
                        top: currY,
                        left: currX - halfThiccness,
                        length: prevY - currY,
                        height: linkThiccness,
                        orientation: ORIENTATION_VERTICAL
                    });
                }
                // adding a square hitbox after the turn because
                // the next point after currLinkPoint will be
                // horizontal to currLinkPoint
                cornerSquareHitBoxes.push({
                    top: currY - halfThiccness,
                    left: currX - halfThiccness,
                    length: linkThiccness,
                    height: linkThiccness,
                    orientation: ORIENTATION_VERTICAL
                });
            }
        });
        cornerSquareHitBoxes = cornerSquareHitBoxes.map(function(square) {
            square.isCorner = true;
            square.centerX = square.left + halfThiccness + (BUTTON_TRAY_HEIGHT / 2);
            square.centerY = square.top + halfThiccness + (BUTTON_TRAY_HEIGHT / 2);
            return square;
        });
        // corner hitboxes take precedence over other hitboxes
        return cornerSquareHitBoxes.concat(hitboxes);
    }

    function getHitboxContainingPoint(pointToCheck, hitboxes) {
        for (var i = 0; i < hitboxes.length; i++) {
            var rect = hitboxes[i];
            var x = pointToCheck.x;
            var y = pointToCheck.y;
            if (
                rect.orientation === ORIENTATION_HORIZONTAL &&
                x >= rect.left &&
                x <= rect.left + rect.length &&
                y >= rect.top &&
                y <= rect.top + rect.height
            )
                return rect;
            if (
                rect.orientation === ORIENTATION_VERTICAL &&
                x >= rect.left &&
                x <= rect.left + rect.height &&
                y >= rect.top &&
                y <= rect.top + rect.length
            )
                return rect;
        }
        return null;
    }

    function getMiddlePointOfLink(link) {
        const linkPoints = link.points.toArray();
        if (linkPoints.length === 0) {
            return {
                x: 0,
                y: 0
            };
        }
        let totalX = 0,
            totalY = 0;
        linkPoints.forEach((point) => {
            totalX += point.x;
            totalY += point.y;
        });
        return {
            x: (totalX / linkPoints.length) - 12,
            y: totalY / linkPoints.length
        };
    }

    function showToolbar({e, link, callback, options}) {
        if (isLaneLinkWithoutStages(link))
            return;

        var payload = {
            type: TOOLBAR_TYPE_CONNECTOR,
            position: undefined,
            linkData: undefined
        };
        try {
            payload.linkData = {
                isLaneLink: link.data.isLaneLink,
                from: link.data.from,
                to: link.data.to,
                orientation: undefined,
                isDecisionEdge: link.data.isDecisionEdge,
                callback: typeof callback === 'function' ? callback : function() {}
            };
            if (options?.position === 'center') {
                payload.position = getMiddlePointOfLink(link);
            } else {
                var linkThiccness = link.computeThickness();
                // link.points API returns ordered collection of points
                // starting from beginning of link to end of link
                var linkPoints = link.points.toArray();
                // Step 1 - Create hitboxes from a list of points along this link
                var hitboxes = computeHitboxesFromLinkPoints(linkPoints, linkThiccness);
                // Step 2 - Loop through hitboxes to see if the pointToCheck
                // can exist in one of the hitboxes
                var pointToCheck = {
                    x: e.documentPoint.x,
                    y: e.documentPoint.y
                };
                var rect = getHitboxContainingPoint(pointToCheck, hitboxes);
                if (!rect)
                    return;
                payload.linkData.orientation = rect.orientation;
                if (rect.isCorner) {
                    payload.position = {
                        x: rect.centerX,
                        y: rect.centerY
                    };
                } else if (payload.linkData.orientation === ORIENTATION_HORIZONTAL) {
                    payload.position = {
                        x: pointToCheck.x,
                        y: rect.top + POPOVER_CLOSENESS_OFFSET
                    };
                } else if (payload.linkData.orientation === ORIENTATION_VERTICAL) {
                    payload.position = {
                        // now-popover should slightly overlap with the thickness of the
                        // link so not to trigger mouseLeave event so easily
                        x: rect.left + POPOVER_CLOSENESS_OFFSET,
                        // now-popover doesn't quite horizontally align its vertical center
                        // with the y coordinate of the event so we need a small offset
                        y: pointToCheck.y + POPOVER_VERTICAL_OFFSET
                    };
                }
            }
        } catch (e) {}
        if (payload.position && payload.linkData)
            dispatch('PAD#DIAGRAM_OPEN_BUTTON_TRAY', payload);
    }

    function closeToolbar() {
        dispatch('PAD#DIAGRAM_BUTTON_TRAY_CLOSED', {
            type: TOOLBAR_TYPE_CONNECTOR
        });
    }

    function removeAllLinkAdornments(linkKey, diagram) {
        try {
            var link = diagram.findLinkForKey(linkKey);
            // Deselecting the link will automatically remove all adornments.
            // This seems to be the best way because Part.clearAdornments and
            // Part.removeAdornment do not seem to work consistently
            link.isSelected = false;
        } catch (err) {
            // Do nothing, not end of world if the adornments are
            // still there, they will be gone on refresh or
            // when another link is selected
        }
    }

    var GO_BACK_LINK_COLOR = colorQualitative5;
    var ACTIVITY_NODE_TYPE_GO_BACK = 'go_back';

    function getGoBackSysIdFromLink(link) {
        var fromData = link.fromNode && link.fromNode.data;
        var toData = link.toNode && link.toNode.data;
        if (fromData && fromData.isGoBackClone) return fromData.goBackActivitySysId;
        if (toData && toData.isGoBackClone) return toData.goBackActivitySysId;
        if (fromData && fromData.activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK) return fromData.key;
        return null;
    }

    function applyGoBackPathHover(diagram, goBackSysId, isHover) {
        var pathHoverColor = GO_BACK_LINK_COLOR; // qualitative-5 purple for edges and clone nodes
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
            var shape = n.findObject('MAIN_NODE_SHAPE');
            if (shape) shape.stroke = isHover ? pathHoverColor : GO_BACK_LINK_COLOR;
        });

        // Update path link colors, dash arrays, and bridge opacity
        diagram.links.each(function(link) {
            if (!link.data) return;
            if (!(link.data.isGoBackEdge || link.data.isGoBackTargetEdge)) return;
            if (!pathNodeKeys[link.data.from] && !pathNodeKeys[link.data.to]) return;
            var linkPath = link.findObject(LINK_PATH);
            var arrowhead = link.findObject(LINK_ARROWHEAD);
            if (linkPath) {
                linkPath.stroke = isHover ? pathHoverColor : GO_BACK_LINK_COLOR;
                if (!link.data.isGoBackBridgeEdge)
                    linkPath.strokeDashArray = isHover ? null : [6, 4];
            }
            if (arrowhead) arrowhead.fill = isHover ? pathHoverColor : GO_BACK_LINK_COLOR;
            if (link.data.isGoBackBridgeEdge) link.opacity = isHover ? 1.0 : 0.1;
        });
    }

    function isIncomingToLoopbackNode(link) {
        var toData = link?.toNode?.data;
        return toData?.activityNodeType === ACTIVITY_NODE_TYPE_GO_BACK && toData?.isGoBackClone === true;
    }

    function getLinkColor(isRedundant, isLaneLink, isGoBackEdge, isOnGoldenPath) {
        if (isGoBackEdge) {
            return GO_BACK_LINK_COLOR;
        } else if (isRedundant) {
            return colorAlertHigh2;
        } else if (isOnGoldenPath) {
            return colorIdealPath;
        } else if (isLaneLink) {
            return colorBorderTertiaryActionable;
        } else {
            return colorBorderPrimary;
        }
    }

    function isLaneLinkWithoutStages(link) {
        return !link.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES] && link.data.isLaneLink;
    }

    return $(
        go.Link,
        go.Link.Orthogonal,
        new go.Binding('opacity', '', function(data) {
            if (data.isHidden) return 0.0;
            // isTranslucent: fades the from→GoBack connector when GoBack has no target
            // configured yet, indicating the connection is pending/incomplete.
            if (data.isTranslucent) return 0.4;
            // Bridge arc (TO-clone → FROM-clone) is rendered at 10% opacity.
            if (data.isGoBackBridgeEdge) return 0.1;
            return 1.0;
        }),
        new go.Binding('selectable', '', function(data, link) {
            // Readonly mode is selectable because wcag tabbing requires it to function
            if (isPreviewMode(link))
                return false;

            if (data.isHidden)
                return false;

            if (isLaneLinkWithoutStages(link))
                return false;

            return true;
        }),
        new go.Binding('selectionAdorned', '', function(data, link) {
            // Don't actually do anything on selection in readonly mode
            if (!isEditMode(link))
                return false;

            return true;
        }),
        new go.Binding('layerName', '', function(data) {
            // The FROM-clone → target-activity edge has BOTH flags set and crosses the stage
            // boundary (FROM clone is outside, target is inside). Rendering it on 'Foreground'
            // prevents the stage's background panel from occluding it.
            // The GoBack → FROM-clone edge (isGoBackTargetEdge only, both endpoints outside)
            // and the activity → GoBack edge (isGoBackEdge only, handled by group context)
            // both render correctly without this override.
            if (data.isGoBackEdge && data.isGoBackTargetEdge) return 'Foreground';
            return data.isLaneLink ? 'Background' : '';
        }),
        new go.Binding('mouseHover', '', function(data) {
            return function(e, link, options) {
                if (!isEditMode(link)) return;

                if (!data.isHidden) {
                    showToolbar({e, link, options});
                }
            }
        }),
        new go.Binding('toShortLength', 'toShortLength', function(toShortLength) {
            return toShortLength || 0;
        }),
        new go.Binding('fromShortLength', 'fromShortLength', function(fromShortLength) {
            return fromShortLength || 0;
        }),
        new go.Binding('routing', 'isGoBackTargetEdge', function(isGoBackTargetEdge) {
            return isGoBackTargetEdge ? go.Link.Orthogonal : go.Link.AvoidsNodes;
        }), {
            routing: go.Link.AvoidsNodes,
            relinkableFrom: true,
            relinkableTo: true,
            corner: 16,
            fromEndSegmentLength: END_SEGMENT_LENGTH,
            toEndSegmentLength: END_SEGMENT_LENGTH,
            mouseEnter: function(e, link) {
                if (isPreviewMode(link)) return;

                if (isLaneLinkWithoutStages(link))
                    return;

                link.findObject(LINK_PATH).stroke = colorPrimary0;
                link.findObject(LINK_ARROWHEAD).fill = colorPrimary0;
                if (link.data.isRedundant) {
                    link.findObject(LINK_HIGHLIGHT).stroke = colorAlertHigh0;
                } else {
                    link.findObject(LINK_HIGHLIGHT).stroke = colorFocus2;
                }
                if (link.data.isGoBackEdge || link.data.isGoBackTargetEdge) {
                    var goBackSysId = getGoBackSysIdFromLink(link);
                    if (goBackSysId) applyGoBackPathHover(link.diagram, goBackSysId, true);
                }
            },
            mouseLeave: function(e, link) {
                if (isLaneLinkWithoutStages(link))
                    return;

                var isGoBackRelated = link.data.isGoBackEdge || isIncomingToLoopbackNode(link);
                link.findObject(LINK_PATH).stroke = getLinkColor(link.data.isRedundant, link.data.isLaneLink, isGoBackRelated, link.data.isOnGoldenPath);
                link.findObject(LINK_ARROWHEAD).fill = getLinkColor(link.data.isRedundant, link.data.isLaneLink, isGoBackRelated, link.data.isOnGoldenPath);
                link.findObject(LINK_HIGHLIGHT).stroke = "transparent";
                closeToolbar();
                if (link.data.isGoBackEdge || link.data.isGoBackTargetEdge) {
                    var goBackSysId = getGoBackSysIdFromLink(link);
                    if (goBackSysId) applyGoBackPathHover(link.diagram, goBackSysId, false);
                }
            }
        },
        $(go.Shape, {
            isPanelMain: true,
            name: LINK_HIGHLIGHT,
            strokeWidth: HIGHLIGHT_WIDTH,
            stroke: "transparent",
        }),
        $(go.Shape,
            new go.Binding("strokeDashArray", "", function(obj) {
                var link = obj.part;
                if (!obj.data.isGoBackBridgeEdge && (obj.data.isGoBackEdge || isIncomingToLoopbackNode(link))) return [6, 4];
                return obj.data.isRedundant ? [5, 3] : null;
            }).ofObject(),
            new go.Binding("stroke", "", function(obj) {
                var link = obj.part;
                var isGoBackRelated = obj.data.isGoBackEdge || isIncomingToLoopbackNode(link);
                return getLinkColor(obj.data.isRedundant, obj.data.isLaneLink, isGoBackRelated, obj.data.isOnGoldenPath);
            }).ofObject(),
            new go.Binding("strokeWidth", "", function(obj) {
                var link = obj.part;
                var isGoBackRelated = obj.data.isGoBackEdge || isIncomingToLoopbackNode(link);
                var isGoldenPathColored = !isGoBackRelated && !obj.data.isRedundant && obj.data.isOnGoldenPath;
                return isGoldenPathColored ? 5 : 2;
            }).ofObject(), {
                name: LINK_PATH,
                isPanelMain: true,
                strokeWidth: 2
            }
        ),
        $(go.Shape,
            new go.Binding("fill", "", function(obj) {
                var link = obj.part;
                var isGoBackRelated = obj.data.isGoBackEdge || isIncomingToLoopbackNode(link);
                return getLinkColor(obj.data.isRedundant, obj.data.isLaneLink, isGoBackRelated, obj.data.isOnGoldenPath);
            }).ofObject(), {
                name: LINK_ARROWHEAD,
                toArrow: "Triangle",
                segmentOffset: new go.Point(1, 0),
                stroke: null
            }), {
            selectionAdornmentTemplate: $(
                go.Adornment,
                "Link", {
                    mouseEnter: function(e, adornment) {
                        if (!isEditMode(e)) return;

                        adornment.adornedPart.toShortLength = 0;
                        adornment.adornedPart.fromShortLength = 0;
                        adornment.findObject(LINK_ADORNMENT_PATH).stroke = colorPrimary0;
                        adornment.findObject(LINK_ADORNMENT_ARROWHEAD).fill = colorPrimary0;
                        adornment.findObject(LINK_ADORNMENT_HIGHLIGHT).stroke = colorFocus2;
                    },
                    mouseLeave: function(e, adornment) {
                        adornment.adornedPart.toShortLength = adornment.adornedPart.data.toShortLength || 0;
                        adornment.adornedPart.fromShortLength = adornment.adornedPart.data.fromShortLength || 0;
                        adornment.findObject(LINK_ADORNMENT_PATH).stroke = colorPrimary1;
                        adornment.findObject(LINK_ADORNMENT_ARROWHEAD).fill = colorPrimary1;
                        adornment.findObject(LINK_ADORNMENT_HIGHLIGHT).stroke = "transparent";
                        closeToolbar();
                    },
                    mouseHover: function(e, adornment) {
                        if (!isEditMode(e)) return;

                        var link = adornment.adornedPart;
                        // We can't save 'link' object reference here to be used later, it seems
                        // to be cleared immediately after this mouseHover call. However e.diagram
                        // does not, so we can use link.key (string) + e.diagram + Diagram.findLinkForKey
                        // to find the link again at a later time
                        var callback = removeAllLinkAdornments.bind(this, link.key, e.diagram);
                        showToolbar({e, link, callback});
                    }
                },
                $(go.Shape, {
                    isPanelMain: true,
                    name: LINK_ADORNMENT_HIGHLIGHT,
                    strokeWidth: HIGHLIGHT_WIDTH,
                    stroke: "transparent",
                }),
                $(go.Shape,
                    new go.Binding("strokeDashArray", "", function(data) {
                        if (!data.isGoBackBridgeEdge && (data.isGoBackEdge || data.isGoBackTargetEdge)) return [6, 4];
                        return data.isRedundant ? [5, 3] : null;
                    }), {
                        name: LINK_ADORNMENT_PATH,
                        isPanelMain: true,
                        stroke: colorPrimary1,
                        strokeWidth: 2
                    }),
                $(
                    go.Shape, // the arrowhead
                    {
                        name: LINK_ADORNMENT_ARROWHEAD,
                        toArrow: "Triangle",
                        fill: colorPrimary1,
                        segmentOffset: new go.Point(1, 0),
                        stroke: null
                    }
                ),
                $(go.Shape, 'Circle', {
                    width: PORT_SIZE,
                    height: PORT_SIZE,
                    fill: colorWhite,
                    stroke: colorPrimary1,
                    strokeWidth: 2,
                    segmentIndex: 0,
                    isActionable: true,
                    actionMove: function(e, obj) {
                        drawLink(e, obj, true);
                    }
                }),
                $(go.Shape, 'Circle', {
                    width: PORT_SIZE,
                    height: PORT_SIZE,
                    fill: colorWhite,
                    stroke: colorPrimary1,
                    strokeWidth: 2,
                    segmentIndex: -1,
                    isActionable: true,
                    actionMove: function(e, obj) {
                        drawLink(e, obj, false);
                    }
                })
            )
        },
        $(go.TextBlock, {
            // This text block is only a way to position mouse events when the user
            // interacts with wcag buttons (hidden buttons that allow 'tabbing' to diagram objects).
            // When the user tabs to a wcag button representing this link, a mouse enter is simulated
            // on this text block situated in the middle of the link. Otherwise the mouse enter
            // location might not be correct.
            text: '',
            name: LINK_LABEL,
        }),
    );
}
