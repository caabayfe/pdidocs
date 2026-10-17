function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    var triangleLength = 15;
    var endNodes = ['ENDIF', 'ENDLOOP', 'ENDDOLOOP', 'ENDDECISION', 'ENDPARALLEL', 'ENDCATCH'];
    var FLOWLOGIC_GOBACKTO = "Go back to";

    // Traverse node path backwards or forwards to find non-ENDing node - or a valid instance node
    // direction param is the direction to look - 'from' or 'to'
    var findInstanceNode = function findInstanceNode(currentNode, diagramModel, direction) {
        var currentNodeData = currentNode.data;
        // Check if this node is an END node - if not, we're done
        if (!endNodes.includes(currentNodeData.name) || currentNodeData.instance_sys_id) {
            return currentNodeData;
        }

        var foundNodes;
        // Find the nodes to the current node from the direction we want
        if (direction === 'from') {
            foundNodes = currentNode.findNodesInto();
        } else {
            foundNodes = currentNode.findNodesOutOf();
        }

        // If there is more than one, just return 'Multiple Nodes'
        if (!foundNodes) {
            return currentNodeData;
        } else if (foundNodes.count > 1) {
            // Node data needs to be copied so that we don't mess up actual diagram data
            var copiedNodeData = Object.assign({}, currentNodeData);
            copiedNodeData.name = 'Multiple nodes';
            copiedNodeData.order = '';
            return copiedNodeData;
        }

        // With a single link found, get the node in the direction we want
        var nextNode = foundNodes.first();

        // Rinse and repeat
        return findInstanceNode(nextNode, diagramModel, direction);
    };

    var translateNodeName = function translateNodeName(nodeName) {
        if (nodeName === 'Add a node') {
            return 'END';
        } else {
            return nodeName;
        }
    };

    var getGoBackToNodeList = function(nodes) {
        var goNodesList = [];
        nodes.each(function(node) {
            if (node.data.name === FLOWLOGIC_GOBACKTO) {
                goNodesList.push(node.data.key);
            }
        });
        return goNodesList;
    };

    // returns array of fromNode orders
    var getFromNodeOrderList = function(toNode, fromNodeData, nodes) {
        var nodesIt = toNode.findNodesInto();
        // if 1 or less nodes into then no need to do extra work
        if (nodesIt.count <= 1 || endNodes.includes(toNode.data.name)) {
            return fromNodeData.order ? [fromNodeData.order] : [];
        }
        // determine if there are multiple fromNodes pointing to node, can be from a GoBackTo
        var goNodesList = getGoBackToNodeList(nodes);
        if (!goNodesList.includes(fromNodeData.key)) {
            return fromNodeData.order ? [fromNodeData.order] : [];
        }
        var fromNodeOrders = [];
        while (nodesIt.next()) {
            var node = nodesIt.value;
            if (goNodesList.includes(node.key)) {
                fromNodeOrders.push(node.data.order);
            }
        }
        if (fromNodeOrders.length > 0) {
            return fromNodeOrders;
        } else if (fromNodeData.order) {
            return [fromNodeData.order];
        }
        return [];
    };

    var getOrderString = function(nodeData) {
        return nodeData.order ? (nodeData.order + ' - ') : '';
    };

    // Find Catch node linked to a node, if any
    var findLinkedCatch = function(node, diagram) {
        var nextFromNode = node;
        while (nextFromNode) {
            var nextParentKey = nextFromNode.data.parent ||
                (nextFromNode.data.relation && nextFromNode.data.relation.parent) ||
                nextFromNode.data.endParallelNodeKey ||
                nextFromNode.data.endDecisionNodeKey ||
                nextFromNode.data.endCatchNodeKey;
            var parentNode = nextParentKey && diagram.findNodeForKey(nextParentKey);
            if (parentNode) {
                // if TRY found, that means original node is a descendant, so use dotted link
                if (parentNode.data.definition_type === 'TRY' &&
                    parentNode.data.connectedTo) {
                    // connecedTo key should be the Catch that's connected to this Try
                    return diagram.findNodeForKey(parentNode.data.connectedTo);
                }
            } else if (nextParentKey) {
                // parent is valid but node is not, means it's a node not shown in diagram (i.e. ELSE)
                // find previous node instead by using link that goes to this node
                var links = diagram.findLinksByExample({
                    to: nextFromNode.data.key
                });
                nextParentKey = links.first() && links.first().data.from;
                parentNode = nextParentKey && diagram.findNodeForKey(nextParentKey);
            }
            nextFromNode = parentNode;
        }
        return null;
    };

    return $(go.Adornment, "Spot",
        $(go.Placeholder, {
            padding: 5
        }),
        $(go.Panel, "Auto",
            $(go.Shape, "RoundedRectangle", {
                fill: resolveThemeVariable("--now-color--neutral-19") || "#0B1012",
                stroke: resolveThemeVariable("--now-color--neutral-7") || "#8F95A1",
                parameter1: resolveThemeVariable("--now-actionable--border-radius") || "6px",
            }),
            $(go.TextBlock, {
                    margin: new go.Margin(4, 8),
                    stroke: resolveThemeVariable("--now-color--neutral-0") || "#FFFFFF",
                    font: '12px "Open Sans", sans-serif',
                    maxSize: new go.Size(175, NaN)
                },
                new go.Binding("text", "", function(linkData, obj) {
                    var diagram = obj.diagram;

                    // Find "from" and "to" node data
                    var fromNode = diagram.findNodeForKey(linkData.from);
                    var toNode = diagram.findNodeForKey(linkData.to);
                    var fromNodeData = findInstanceNode(fromNode, diagram.model, 'from');
                    var toNodeData = findInstanceNode(toNode, diagram.model, 'to');

                    // GoBackTo Logic
                    var fromNodeOrderList = getFromNodeOrderList(toNode, fromNodeData, diagram.nodes);

                    // Build string for from/to order, if it exists
                    var fromNodeOrder = fromNodeOrderList && fromNodeOrderList.length > 0 ? (fromNodeOrderList.join(', ') + ' - ') : '';
                    var toNodeOrder = getOrderString(toNodeData);

                    // Build string for from/to text
                    var fromNodeText = translateNodeName(fromNodeData.label || fromNodeData.name);
                    var toNodeText = translateNodeName(toNodeData.label || toNodeData.name);

                    // Build from/to toolTip text
                    var toolTipText = "From: " + fromNodeOrder + fromNodeText + "\nTo: " + toNodeOrder + toNodeText;

                    // Add error handling text if needed and not already set as the toNode
                    var linkedCatch = findLinkedCatch(fromNode, diagram);
                    if (linkedCatch && linkedCatch.data.key !== toNodeData.key) {
                        toolTipText += "\nOR: " + getOrderString(linkedCatch.data) + linkedCatch.data.name;
                    }
                    return toolTipText;
                })
            ),
            // Binding for the entire Panel
            new go.Binding("alignment", "", function(linkData, obj) {
                var alignmentSpot = new go.Spot();
                var diagram = obj.diagram;

                // Position of the mouse
                var link = diagram.findLinkForData(linkData);
                if (!link || !diagram.lastInput) {
                    // Something terrible happened, abort abort
                    return alignmentSpot;
                }
                var documentPoint = diagram.lastInput.documentPoint;
                var linkPoints = link.points.toArray();

                // Find lowest X and Y
                var boundsMinX = linkPoints[0].x;
                var boundsMinY = linkPoints[0].y;
                link.points.each(function(p) {
                    boundsMinX = Math.min(boundsMinX, p.x);
                    boundsMinY = Math.min(boundsMinY, p.y);
                });

                var xOffsetToMinX = documentPoint.x - boundsMinX;
                var yOffsetToMinY = documentPoint.y - boundsMinY;

                alignmentSpot.x = xOffsetToMinX / link.measuredBounds.width;
                alignmentSpot.y = yOffsetToMinY / link.measuredBounds.height;
                alignmentSpot.offsetY = -40;

                return alignmentSpot;
            })
        ),
        $(go.Shape, "TriangleDown", {
                width: triangleLength,
                height: triangleLength,
                fill: resolveThemeVariable("--now-color_border--secondary") || "#A9B2B7",
                stroke: resolveThemeVariable("--now-color_border--secondary") || "#A9B2B7"
            },
            new go.Binding("alignment", "", function(linkData, obj) {
                var alignmentSpot = new go.Spot();
                var diagram = obj.diagram;

                // Sometimes we need to hide this shape; reset just in case
                obj.visible = true;

                // Scale the triangle size
                obj.width = triangleLength * diagram.scale;
                obj.height = triangleLength * diagram.scale;

                // Position of the mouse
                var link = diagram.findLinkForData(linkData);
                if (!link || !diagram.lastInput) {
                    // Something terrible happened, abort abort
                    return alignmentSpot;
                }
                var documentPoint = diagram.lastInput.documentPoint;
                var linkPoints = link.points.toArray();

                // Find lowest X and Y
                var boundsMinX = linkPoints[0].x;
                var boundsMinY = linkPoints[0].y;
                link.points.each(function(p) {
                    boundsMinX = Math.min(boundsMinX, p.x);
                    boundsMinY = Math.min(boundsMinY, p.y);
                });

                var xOffsetToMinX = undefined;
                var yOffsetToMinY = undefined;
                var mouseOffsetX = 0;
                var mouseOffsetY = 0;

                // Get segment from and to points
                var segmentIndex = link.findClosestSegment(new go.Point(documentPoint.x, documentPoint.y));
                var toPoint = linkPoints[segmentIndex + 1];
                var fromPoint = linkPoints[segmentIndex];

                // Determine if X or Y is static, use the static value
                if (toPoint.y === fromPoint.y) {
                    // Y doesn't change, we have a horizontal segment
                    var segmentMinX = Math.min(toPoint.x, fromPoint.x);
                    var segmentMaxX = Math.max(toPoint.x, fromPoint.x);

                    // Check if segment is really short - if so, don't bother showing this
                    if (segmentMaxX - segmentMinX < 75) {
                        obj.visible = false;
                        return alignmentSpot;
                    }

                    yOffsetToMinY = fromPoint.y - boundsMinY;
                    mouseOffsetX = -15;

                    // Segment goes from left to right
                    if (toPoint.x > fromPoint.x) {
                        obj.angle = 270;
                    } else {
                        // Segment goes from right to left
                        obj.angle = 90;
                    }

                    // If this shape shows beyond the min X of segment, switch to other side of cursor
                    if (segmentMinX >= documentPoint.x + mouseOffsetX - 5) {
                        mouseOffsetX = 25;
                    }
                } else if (toPoint.x === fromPoint.x) {
                    // X doesn't change, we have a vertical segment
                    var segmentMinY = Math.min(toPoint.y, fromPoint.y);
                    var segmentMaxY = Math.max(toPoint.y, fromPoint.y);

                    // Check if segment is really short - if so, don't bother showing this
                    if (segmentMaxY - segmentMinY < 75) {
                        obj.visible = false;
                        return alignmentSpot;
                    }

                    xOffsetToMinX = fromPoint.x - boundsMinX;
                    mouseOffsetY = 30;

                    // Segment goes from bottom to top
                    if (toPoint.y < fromPoint.y) {
                        obj.angle = 180;
                    } else {
                        // Segment goes from top to bottom
                        obj.angle = 0;
                    }

                    // If this shape shows beyond the max Y of segment, switch to other side of cursor
                    if (segmentMaxY <= documentPoint.y + mouseOffsetY + 5) {
                        mouseOffsetY = -15;
                    }
                }

                // For whichever direction that isn't static, find difference to the min
                if (xOffsetToMinX === undefined) xOffsetToMinX = documentPoint.x - boundsMinX;
                if (yOffsetToMinY === undefined) yOffsetToMinY = documentPoint.y - boundsMinY;

                // Scale the difference to the min (required for use in a go.Spot)
                alignmentSpot.y = yOffsetToMinY / link.measuredBounds.height;

                // Calculate diagram scale compensation (only X needs it for some reason)
                var diagramScaleOffsetX;
                // Base offset
                diagramScaleOffsetX = ((diagram.scale - 1) * 10 * 1.5) || 1.5;
                // More offset the more the scale is deviated from 1
                diagramScaleOffsetX += Math.abs(1 + (diagram.scale * diagram.scale) - 2 * diagram.scale) * 1.5;
                // More offset when scale is under 1 or over 2
                if (diagram.scale < 1) {
                    diagramScaleOffsetX += (1 - diagram.scale) * 10 * (Math.max(obj.width / 7, 1.25));
                } else if (diagram.scale >= 2) {
                    diagramScaleOffsetX += (diagram.scale - 2) * 9 * (obj.width / 25);
                }

                // There is slightly extra height/width in measuredBounds than if you were to measure
                // the difference betwen min/max of X/Y of all link segments
                // Therefore, there is some weird logic here to compensate scaling differences
                alignmentSpot.offsetX = (diagram.scale * ((obj.width / 2) + xOffsetToMinX + mouseOffsetX)) - diagramScaleOffsetX;
                alignmentSpot.offsetY = (obj.height - 4) * Math.max(.5, alignmentSpot.y) + mouseOffsetY;

                return alignmentSpot;
            })
        )
    );
}
