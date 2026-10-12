function getFlowDiagrammingLayout($, go) {
    var SYS_IDS = FlowDiagramConstants.SYS_IDS;
    var LAYOUT_CONFIGURATION = FlowDiagramConstants.LAYOUT_CONFIGURATION;
    var NODE_TYPES = FlowDiagramConstants.NODE_TYPES;
    var SOURCE_NODE_KEYS = FlowDiagramConstants.SOURCE_NODE_KEYS;
    var FLOW_LOGIC_TYPES = FlowDiagramConstants.FLOW_LOGIC_TYPES;
    var INSTANCE_TYPES = FlowDiagramConstants.INSTANCE_TYPES;

    // Class structure in order to support gojs 3.x upgrade
    class FlowDiagramLayout extends go.Layout {
        constructor() {
            super(); // Call the base class's constructor
            // Initialize your layout-specific properties
            this._dimensions = new go.Map();
            this._nodes = new go.Map();
            this._hiddenElseLinks = new go.Map();
        }

        // Override any methods or add custom methods as needed
        doLayout(coll) {
            // Custom layout logic
            super.doLayout(coll); // Optionally call the base method
        }
    }

    /*****************************
            start of helper methods
     ******************************/
    FlowDiagramLayout.prototype._resetMapData = function() {
        this._dimensions.clear();
        this._nodes.clear();
        this._hiddenElseLinks.clear();
    };

    FlowDiagramLayout.prototype.getNodeId = function(node, key) {
        if (!key) {
            key = LAYOUT_CONFIGURATION.NODE_ID;
        }
        if (!node || !node.data || !node.data[key]) {
            return "";
        }
        return node.data[key];
    };

    FlowDiagramLayout.prototype.getNodeShapeType = function(node, key) {
        /*  Node shape template types:
            simple      - single input, single output: ex. trigger, action, stage
            end         - hidden node
            block       - ex. forEach (loop), parallel branch (block), decision branch (block)
            conditional - single input, true/false outputs: ex. if, elseIf
            oneToMany   - single input, many outputs: ex. parallel, decision
        */
        var sysId = this.getNodeId(node, key);
        var linkIt = node.findLinksOutOf();
        var numLinksOut = linkIt.count;


        if (this.isEndDoLoop(node)) {
            return NODE_TYPES.END;
        } else if (this.isTryNode(node)) {
            return NODE_TYPES.BLOCK;
        }

        switch (true) {
            case sysId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_TRIGGER_NODE_ID:
            case sysId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_TRIGGER_NODE_ID:
            case sysId === SYS_IDS.FLOW_LOGIC_PATH_BROKEN_ACTION && numLinksOut <= 1:
            case sysId === SYS_IDS.FLOW_ACTION_DIAGRAM_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_STAGE_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_ONE_TO_ONE_ACTION:
            case sysId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_SUBFLOW_INS_OUTS_NODE_ID:
            case sysId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_A_SUBFLOW_INS_OUTS_NODE_ID:
            case sysId === SYS_IDS.FLOW_PLACEHOLDER_ACTION:
                return NODE_TYPES.SIMPLE;
            case sysId === SYS_IDS.FLOW_LOGIC_LOOP_DIAGRAM_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_DO_LOOP_DIAGRAM_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_PARALLEL_BLOCK_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_DECISION_BLOCK_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_TRY_ACTION:
                return NODE_TYPES.BLOCK;
            case sysId === SYS_IDS.FLOW_LOGIC_END_LOOP_IF_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_END_DO_LOOP_IF_ACTION:
            case sysId === SYS_IDS.FLOW_LOGIC_PATH_BROKEN_ACTION && node.data.loopStartNodeKey && numLinksOut === 2:
            case sysId === SYS_IDS.FLOW_LOGIC_END_CATCH_ACTION:
                return NODE_TYPES.END;
            case sysId === SYS_IDS.FLOW_LOGIC_CONDITIONAL_DIAGRAM_ACTION:
                return NODE_TYPES.CONDITIONAL;
            case sysId === SYS_IDS.FLOW_LOGIC_ONE_TO_MANY_ACTION:
                return NODE_TYPES.ONE_TO_MANY;
            case sysId === SYS_IDS.FLOW_LOGIC_GO_BACK_TO_ACTION:
                return NODE_TYPES.GO_BACK_TO;
            case sysId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_A_NODE_NODE_ID:
                return NODE_TYPES.ADD_A_NODE;
            case sysId === SYS_IDS.FLOW_LOGIC_CATCH_ACTION:
                return NODE_TYPES.TRY_CATCH;
            case sysId === SYS_IDS.FLOW_LOGIC_CONTINUE_ACTION:
                return NODE_TYPES.CONTINUE;
            default:
                return "";
        }
    };

    FlowDiagramLayout.prototype.isConditionalTruePort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_IF_ELSE_OUTPUT_TRUE_SYS_ID;
    };

    FlowDiagramLayout.prototype.isConditionalFalsePort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_IF_ELSE_OUTPUT_FALSE_SYS_ID;
    };

    FlowDiagramLayout.prototype.isBreakPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_BREAK_OUTPUT_SYS_ID;
    };

    FlowDiagramLayout.prototype.isBreakPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_BREAK_OUTPUT_SYS_ID;
    };

    FlowDiagramLayout.prototype.isLoopBackPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_FOR_INPUT_LOOP_BACK_SYS_ID ||
            portId === SYS_IDS.DIAGRAM_PORT_FOR_INPUT_DO_LOOP_BACK_SYS_ID;
    };

    FlowDiagramLayout.prototype.isUntilLoopOutputPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_END_DO_LOOP_OUTPUT_LOOPBACK_SYS_ID;
    };

    FlowDiagramLayout.prototype.isGoBackToOutputPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_GOBACKTO_OUTPUT_SYS_ID;
    };

    FlowDiagramLayout.prototype.isGoBackToInputPort = function(portId) {
        return portId === SYS_IDS.DIAGRAM_PORT_GOBACKTO_INPUT_SYS_ID;
    };

    FlowDiagramLayout.prototype.isFlowTriggerOrSubflowInputsOutputs = function(node) {
        var nodeId = this.getNodeId(node);
        return nodeId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_TRIGGER_NODE_ID || nodeId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_TRIGGER_NODE_ID || nodeId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_SUBFLOW_INS_OUTS_NODE_ID || nodeId === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_A_SUBFLOW_INS_OUTS_NODE_ID;
    };

    FlowDiagramLayout.prototype.isFlowEnd = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_DIAGRAM_TEMPLATE_ADD_A_NODE_NODE_ID;
    };

    FlowDiagramLayout.prototype.isPathBroken = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_PATH_BROKEN_ACTION;
    };

    FlowDiagramLayout.prototype.isConditionalNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_CONDITIONAL_DIAGRAM_ACTION;
    };

    FlowDiagramLayout.prototype.isIfNode = function(node) {
        return this.getNodeId(node, LAYOUT_CONFIGURATION.DEFINITION_SYS_ID) === SYS_IDS.FLOW_LOGIC_IF_DEFINITION_SYS_ID;
    };

    FlowDiagramLayout.prototype.isElseIfNode = function(node) {
        return this.getNodeId(node, LAYOUT_CONFIGURATION.DEFINITION_SYS_ID) === SYS_IDS.FLOW_LOGIC_ELSEIF_DEFINITION_SYS_ID;
    };

    FlowDiagramLayout.prototype.isElseNodeKey = function(nodeKey) {
        var node = this._nodes.get(nodeKey);
        if (!node && this._hiddenElseLinks.get(nodeKey)) {
            return true;
        }
        return false;
    };

    FlowDiagramLayout.prototype.isLoopNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_LOOP_DIAGRAM_ACTION ||
            this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_DO_LOOP_DIAGRAM_ACTION;
    };

    FlowDiagramLayout.prototype.isDoLoopNode = function(node) {
        return this.getNodeId(node, LAYOUT_CONFIGURATION.DEFINITION_SYS_ID) === SYS_IDS.FLOW_LOGIC_DOUNTIL_DEFINITION_SYS_ID;
    };

    FlowDiagramLayout.prototype.isLogicBlockNode = function(node) {
        return this.isIfNode(node) || this.isElseIfNode(node) || this.isLoopNode(node);
    };

    FlowDiagramLayout.prototype.isGoBackToNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_GO_BACK_TO_ACTION;
    };

    FlowDiagramLayout.prototype.isBreakNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_BREAK_ACTION;
    };

    FlowDiagramLayout.prototype.isContinueNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_CONTINUE_ACTION;
    };

    FlowDiagramLayout.prototype.isBreakNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_BREAK_ACTION;
    };

    FlowDiagramLayout.prototype.isContinueNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_CONTINUE_ACTION;
    };

    FlowDiagramLayout.prototype.isGoBackToTargetNode = function(node) {
        var id = this.getNodeId(node, 'key');
        if (id && this.goBackToTargetMap[id]) {
            return true;
        }
        return false;
    };

    FlowDiagramLayout.prototype.isLastNode = function(node) {
        return this.getNodeId(node, 'key') === this.lastNodeKey;
    };

    FlowDiagramLayout.prototype.isActionNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_ACTION_DIAGRAM_ACTION;
    };

    FlowDiagramLayout.prototype.isStageNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_STAGE_ACTION;
    };

    FlowDiagramLayout.prototype.isPathBrokenLoopNode = function(node, numLinksOut) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_PATH_BROKEN_ACTION &&
            node.data.loopStartNodeKey && numLinksOut === 2;
    };

    FlowDiagramLayout.prototype.isOneToOneFlowLogic = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_ONE_TO_ONE_ACTION;
    };

    FlowDiagramLayout.prototype.isOneToManyFlowLogic = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_ONE_TO_MANY_ACTION;
    };

    FlowDiagramLayout.prototype.isSimpleNode = function(node, numLinksOut) {
        return numLinksOut <= 1 && (this.isFlowTriggerOrSubflowInputsOutputs(node) || this.isActionNode(node) || this.isPathBroken(node) || this.isOneToOneFlowLogic(node) || this.isStageNode(node));
    };

    FlowDiagramLayout.prototype.isParallelBlock = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_PARALLEL_BLOCK_ACTION;
    };

    FlowDiagramLayout.prototype.isDecisionBlock = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_DECISION_BLOCK_ACTION;
    };

    FlowDiagramLayout.prototype.isEndNode = function(node) {
        return this.getNodeId(node) === SYS_IDS.FLOW_LOGIC_END_LOOP_IF_ACTION;
    };

    FlowDiagramLayout.prototype.isEndLoop = function(node) {
        return this.isEndNode(node) && node.data[SOURCE_NODE_KEYS.SOURCE_LOOP] !== undefined;
    };

    FlowDiagramLayout.prototype.isEndDoLoop = function(node) {
        return node.data && node.data.instanceType && node.data.instanceType === FLOW_LOGIC_TYPES.ENDDOLOOP
    };

    FlowDiagramLayout.prototype.isEndIf = function(node) {
        return this.isEndNode(node) && node.data[SOURCE_NODE_KEYS.SOURCE_IF] !== undefined;
    };

    FlowDiagramLayout.prototype.isEndCatch = function(node) {
        return this.isEndNode(node) && (node.data[SOURCE_NODE_KEYS.SOURCE_CATCH] !== undefined || node.data.instanceType === FLOW_LOGIC_TYPES.ENDCATCH);
    };

    FlowDiagramLayout.prototype.isEndParallel = function(node) {
        return this.isEndNode(node) && node.data[SOURCE_NODE_KEYS.SOURCE_PARALLEL] !== undefined;
    };

    FlowDiagramLayout.prototype.isEndDecision = function(node) {
        return this.isEndNode(node) && node.data[SOURCE_NODE_KEYS.SOURCE_DECISION] !== undefined;
    };

    FlowDiagramLayout.prototype.isDecisionNode = function(node) {
        if (!node || !node.data || !node.data.data || !node.data.data.hasOwnProperty(LAYOUT_CONFIGURATION.DECISION_LABEL)) {
            return false;
        }
        return true;
    };

    FlowDiagramLayout.prototype.isTryNode = function(node) {
        return node && node.data && node.data.definition_type === FLOW_LOGIC_TYPES.TRY;
    };

    FlowDiagramLayout.prototype.isCatchNode = function(node) {
        return node && node.data && node.data.definition_type === FLOW_LOGIC_TYPES.CATCH;
    };

    FlowDiagramLayout.prototype.isCatchNodeWithChildren = function(node) {
        var nodeData = node.data;
        return nodeData.definition_type === FLOW_LOGIC_TYPES.CATCH &&
            nodeData.relation &&
            nodeData.relation.children &&
            nodeData.relation.children.length;
    };

    FlowDiagramLayout.prototype.isFromTryCatchNode = function(node) {
        var parentId = this.getRelation(node, "parent");
        var previousSiblingId = this.getRelation(node, "previousSibling");
        var parentNode = this._nodes.get(parentId);
        return !previousSiblingId && (this.getNodeId(parentNode) === SYS_IDS.FLOW_LOGIC_TRY_ACTION || this.getNodeId(parentNode) === SYS_IDS.FLOW_LOGIC_CATCH_ACTION);
    };

    FlowDiagramLayout.prototype.fromStageNode = function(node, stageNodesMap) {
        if (node && node.key && stageNodesMap) {
            return stageNodesMap[node.key];
        } else {
            return false;
        }
    };

    FlowDiagramLayout.prototype.isGroupNode = function(node) {
        return this.isConditionalNode(node) || this.isLoopNode(node) || this.isParallelBlock(node) || this.isDecisionBlock(node) || this.isOneToManyFlowLogic(node);
    };

    FlowDiagramLayout.prototype.isGroupParentNode = function(node) {
        return this.isConditionalNode(node) || this.isLoopNode(node) || this.isOneToManyFlowLogic(node);
    };

    FlowDiagramLayout.prototype.getSourceNodeKey = function(node) {
        if (this.isEndLoop(node)) {
            return node.data[SOURCE_NODE_KEYS.SOURCE_LOOP];
        } else if (this.isEndIf(node)) {
            return node.data[SOURCE_NODE_KEYS.SOURCE_IF];
        } else if (this.isEndParallel(node)) {
            return node.data[SOURCE_NODE_KEYS.SOURCE_PARALLEL];
        } else if (this.isEndDecision(node)) {
            return node.data[SOURCE_NODE_KEYS.SOURCE_DECISION];
        } else if (this.isEndCatch(node)) {
            return node.data[SOURCE_NODE_KEYS.SOURCE_CATCH];
        } else {
            return null;
        }
    };

    FlowDiagramLayout.prototype.findPathBrokenSourceNodeKey = function(node) {
        if (!node || !node.data) {
            return "";
        }

        // If Path Broken is from a traditional end node, use that end node key
        var sourceNodeKey = node.data[SOURCE_NODE_KEYS.SOURCE_PARALLEL] || node.data[SOURCE_NODE_KEYS.SOURCE_DECISION] ||
            node.data[SOURCE_NODE_KEYS.SOURCE_IF] || node.data[SOURCE_NODE_KEYS.SOURCE_LOOP] ||
            node.data[SOURCE_NODE_KEYS.SOURCE_CATCH] || node.data[SOURCE_NODE_KEYS.SOURCE_TRY];

        if (sourceNodeKey) {
            return sourceNodeKey;
        }

        // If source node key not found, find associated End node and use its parent
        var endNode = this.diagram.findNodeForKey(node.data.endNodeKey);
        if (endNode) {
            return endNode.data.parent ||
                (endNode.data.relation && endNode.data.relation.parent);
        }

        return null;
    };

    FlowDiagramLayout.prototype.verticallyAligned = function(link, x) {
        // the fromNode is positioned but not the toNode
        // but the horizontal position of the toNode is dependent on the x value
        // Note that we need to deal with the case that
        // the nodes at the ends of the link do not have the same width
        var fromNodeBoundary = link.fromNode.actualBounds;
        var fromPortBoundary = link.fromPort.actualBounds;
        var toNodeBoundary = link.toNode.actualBounds;
        var toPortBoundary = link.toPort.actualBounds;
        return (
            fromNodeBoundary.x + fromPortBoundary.x + fromPortBoundary.width / 2 ===
            x - toNodeBoundary.width / 2 + toPortBoundary.x + toPortBoundary.width / 2
        );
    };

    FlowDiagramLayout.prototype.getRelation = function(node, relation, defaultValue) {
        var result = defaultValue;
        if (node) {
            if (node[relation]) {
                result = node[relation]
            } else if (node.data && node.data.relation) {
                result = node.data.relation[relation];
            }
        }
        return result;
    };

    FlowDiagramLayout.prototype.addToCustomLinks = function(customLinks, link, linkIt) {
        customLinks.add(link);
        if (linkIt.next()) {
            return linkIt.value;
        } else {
            return undefined;
        }
    };

    FlowDiagramLayout.prototype.getBottomPosition = function(nodeBoundary, portBoundary) {
        var x = nodeBoundary.x + portBoundary.x + portBoundary.width / 2;
        var y = nodeBoundary.y + portBoundary.y + portBoundary.height;
        return {
            x: x,
            y: y,
        };
    };

    FlowDiagramLayout.prototype.getTopPosition = function(nodeBoundary, portBoundary) {
        var x = nodeBoundary.x + portBoundary.x + portBoundary.width / 2;
        var y = nodeBoundary.y;
        return {
            x: x,
            y: y,
        };
    };

    FlowDiagramLayout.prototype.getRightPosition = function(nodeBoundary, portBoundary) {
        var x = nodeBoundary.x + portBoundary.x + portBoundary.width;
        var y = nodeBoundary.y + portBoundary.y + portBoundary.height / 2;
        return {
            x: x,
            y: y,
        };
    };

    FlowDiagramLayout.prototype.calculateOneToManyCenterAlignOffset = function(firstX, lastX, currentX, baseX) {
        // We center align the "many" branches by calculating the total x-axis and divide it by 2
        // var baseX = this.x;
        var offSetX = (Math.abs((Math.abs(firstX) + Math.abs(lastX))) / 2);
        if (currentX) {
            baseX = currentX;
        }
        return baseX - offSetX;
    };

    FlowDiagramLayout.prototype.getFromNode = function(node) {
        if (!node) {
            return;
        }
        var linkIt = node.findLinksInto();
        if (linkIt.next()) {
            var link = linkIt.value;
            return link.fromNode;
        }
        return;
    };

    FlowDiagramLayout.prototype.hasPreviousSibling = function(node) {
        if (!node || !node.data || !node.data.relation) {
            return false;
        }
        return node.data.relation.previousSibling;
    };

    FlowDiagramLayout.prototype.isCenterAlignEnabled = function(branchCount, node, parallelMap) {
        if (!branchCount && !node) {
            return LAYOUT_CONFIGURATION.ONE_TO_MANY_ALIGN_CENTER_ENABLED;
        }
        return LAYOUT_CONFIGURATION.ONE_TO_MANY_ALIGN_CENTER_ENABLED && branchCount > 1 && !parallelMap[node.key];
    };

    FlowDiagramLayout.prototype.getLinkHeight = function(link) {
        if (link.data.linkLabel) {
            return LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_WITH_LABEL;
        } else {
            return LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        }
    };

    FlowDiagramLayout.prototype.calculateBlockXAxis = function(x, width, index) {
        return index < 1 ? x : x + width + LAYOUT_CONFIGURATION.NODE_GAP_HORIZONTAL_PARALLEL / 2;
    };

    FlowDiagramLayout.prototype.getLinkSegmentHeight = function(link) {
        if (this.isEndLoop(link.fromNode)) {
            return LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_LOOP_END;
        } else if (this.isDecisionNode(link.fromNode)) {
            return LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_DECISION_WITHOUT_STAGE;
        } else {
            return LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        }
    };

    FlowDiagramLayout.prototype.isIfElseIfLink = function(link) {
        var nextSiblingOfFromNode = this.getRelation(link.fromNode, "nextSibling");
        return (
            link.toNode && link.toNode.data &&
            nextSiblingOfFromNode === link.toNode.data.key &&
            this.isElseIfNode(link.toNode)
        );
    };

    FlowDiagramLayout.prototype.isElseLink = function(link) {
        var nextSiblingOfFromNode = this.getRelation(link.fromNode, "nextSibling");
        var parentOfToNode = this.getRelation(link.toNode, "parent");
        // make sure that nextSiblingOfFromNode exists, which means that there is an ELSE path.
        return nextSiblingOfFromNode && nextSiblingOfFromNode === parentOfToNode;
    };

    FlowDiagramLayout.prototype.shouldUpdateNodeY = function(node, linksIntoResult, stageNodesMap) {
        var fromNode = this.getFromNode(node);
        var isAllowedStageNode = this.hasPreviousSibling(node) && this.isDecisionBlock(node) && this.fromStageNode(node, stageNodesMap);
        // nodes does not have stage || if has presib
        if ((linksIntoResult.customLinks.length > 0 || linksIntoResult.verticalLink) && (!this.fromStageNode(node, stageNodesMap) || isAllowedStageNode) && !(this.isDecisionNode(fromNode) && this.isStageNode(node))) {
            return true;
        }
        return false;
    };

    FlowDiagramLayout.prototype.updateStageNodeRelation = function(nextNode) {
        if (nextNode && this.isStageNode(nextNode) && nextNode.data) {
            if (!nextNode.data.relation) {
                nextNode.data.relation = {};
            }
            nextNode.data.relation.parent = nextNode.data.parent;
            nextNode.data.relation.nextSibling = nextNode.data.associated_node_key;
        }
    };

    FlowDiagramLayout.prototype.getNodeIndex = function(link) {
        var nextNode = link.toNode;
        if (this.isStageNode(nextNode)) {
            var linkIt = nextNode.findLinksOutOf();
            if (linkIt.next()) {
                nextNode = linkIt.value.toNode;
            }
        }
        var currentChildren = this.getRelation(link.fromNode, "children", []);
        return currentChildren.indexOf(nextNode.data.key);
    };
    /*****************************
            end of helper methods
     ******************************/


    FlowDiagramLayout.prototype.invalidBound = function(node) {
        var bound = node.actualBounds;
        return isNaN(bound.x) || isNaN(bound.y);
    };

    FlowDiagramLayout.prototype.getNodeDimension = function(node) {
        if (!node || !node.data) {
            return;
        }
        var dimensionKey = node.data.key;
        var dimension;
        if (this.isGroupNode(node)) {
            dimension = this._dimensions.get("grp-" + dimensionKey);
            if (dimension) {
                return dimension.copy();
            }
        }
        if (this._dimensions.get(dimensionKey)) {
            return this._dimensions.get(dimensionKey).copy();
        }
    };

    FlowDiagramLayout.prototype.setNodeDimension = function(node, boundary) {
        this._dimensions.set(node.data.key, boundary.copy());
    };

    FlowDiagramLayout.prototype.setGroupDimension = function(node, boundary) {
        this._dimensions.set("grp-" + node.data.key, boundary.copy());
    };

    FlowDiagramLayout.prototype.getGroupDimensionByKey = function(key) {
        var dimension = this._dimensions.get("grp-" + key);
        if (dimension) {
            return dimension.copy();
        }
        return;
    };

    FlowDiagramLayout.prototype.setGroupDimensionByKey = function(key, boundary) {
        this._dimensions.set("grp-" + key, boundary.copy());
    };

    FlowDiagramLayout.prototype.enlargeGroupDimension = function(endNode, additionalGap) {
        var sourceNodeKey = this.getSourceNodeKey(endNode);
        if (sourceNodeKey) {
            var sourceGroupDimension = this.getGroupDimensionByKey(sourceNodeKey);
            var endNodeDimension = this._dimensions.get(endNode.data.key);
            var enlargedDimension = endNodeDimension;
            if (sourceGroupDimension) {
                if (additionalGap) {
                    sourceGroupDimension.width = sourceGroupDimension.width + additionalGap;
                }
                enlargedDimension = sourceGroupDimension.unionRect(endNodeDimension);
            }
            this.setGroupDimensionByKey(sourceNodeKey, enlargedDimension);
        }
    };

    FlowDiagramLayout.prototype.getLinkHeightToNode = function(toNode, x) {
        var linkHeight = LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        if (this.fromStageNode(toNode, this.stageNodesMap)) {
            return LAYOUT_CONFIGURATION.STAGE_VERTICAL_LINK;
        }
        if (toNode) {
            var linkIt = toNode.findLinksInto();
            while (linkIt.next()) {
                var link = linkIt.value;
                if (this.verticallyAligned(link, x)) {
                    if (this.isEndLoop(link.fromNode) || this.isEndDoLoop(link.fromNode)) {
                        linkHeight = LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_LOOP_END;
                    } else if (this.isEndIf(link.toNode) || this.isEndCatch(toNode) || this.isEndParallel(link.toNode) || this.isEndDecision(link.toNode)) {
                        if (link.data.linkLabel) {
                            linkHeight = LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_IF_END_WITH_LABEL;
                        } else if (this.isEndCatch(toNode)) {
                            linkHeight = LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
                        } else {
                            linkHeight = LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_IF_END;
                        }
                    } else {
                        linkHeight = this.getLinkHeight(link);
                    }
                    break;
                }
            }
        }
        return linkHeight;
    };

    // Since Stage nodes initially have invalidBound(), a node might not have an actualBounds at this point.
    // If a link.fromNode has an invalidBound(), move link.fromNode based on the node's actualBounds
    FlowDiagramLayout.prototype.moveFromNodeIfInvalidBound = function(link) {
        var node;
        if (link && link.fromNode && link.fromNode.actualBounds && this.invalidBound(link.fromNode)) {
            if (this.stageNodesMap[link.fromNode.key]) {
                node = this._nodes.get(this.stageNodesMap[link.fromNode.key]);
            } else if (link.fromNode.data && link.fromNode.data.relation && link.fromNode.data.relation.previousSibling) {
                node = this._nodes.get(link.fromNode.data.relation.previousSibling);
            }
            if (node && node.actualBounds && !this.invalidBound(node)) {
                link.fromNode.moveTo(node.actualBounds.x - LAYOUT_CONFIGURATION.NODE_GAP_HORIZONTAL_STAGE, node.actualBounds.y + node.actualBounds.height + LAYOUT_CONFIGURATION.STAGE_VERTICAL_LINK);
            }
        }
    };

    // if the fromNode and toNode are ENDOF nodes and fromNode does not have actualBounds
    // get x from originating ENDOF node of fromNode and get y from toNode.actualBounds.y
    // this can happen since an ENDOF node does not have real actualBounds to begin with
    FlowDiagramLayout.prototype.moveNodeIfFromToEndNodeAndInvalidBound = function(link) {
        if (this.invalidBound(link.fromNode) &&
            !this.invalidBound(link.toNode) &&
            this.isEndNode(link.fromNode) &&
            this.isEndNode(link.toNode)) {
            var adjustedX;
            var sourceNode;
            if (link.fromNode.data &&
                this.isEndDecision(link.fromNode) &&
                this._nodes.get(link.fromNode.data[SOURCE_NODE_KEYS.SOURCE_DECISION])) {
                sourceNode = this._nodes.get(link.fromNode.data[SOURCE_NODE_KEYS.SOURCE_DECISION]);
            } else if (link.fromNode.data &&
                this.isEndParallel(link.fromNode) &&
                this._nodes.get(link.fromNode.data[SOURCE_NODE_KEYS.SOURCE_PARALLEL])) {
                sourceNode = this._nodes.get(link.fromNode.data[SOURCE_NODE_KEYS.SOURCE_PARALLEL]);
            }
            if (sourceNode && !this.invalidBound(sourceNode)) {
                adjustedX = sourceNode.actualBounds.x + sourceNode.actualBounds.width / 2 - LAYOUT_CONFIGURATION.ONE_TO_MANY_ICON_X_OFFSET;
                link.fromNode.moveTo(adjustedX, link.toNode.actualBounds.y - LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK);
            }
        }
    };

    FlowDiagramLayout.prototype.categorizeLinksInto = function(linkIt, x) {
        // Should only have at most one vertical link
        // Can be undefined if there is an End node above
        var verticalLink;
        // incoming link from a node above and on the left-hand size
        // the from node is an IF or ELSEIF node and the link is from its false port
        var sideLink;
        var customLinks = new go.List();
        var downLinks = new go.List();
        var rightLinks = new go.List();
        while (linkIt.next()) {
            var link = linkIt.value;
            this.moveFromNodeIfInvalidBound(link);
            this.moveNodeIfFromToEndNodeAndInvalidBound(link);

            // Error case: Should not happen
            if (this.invalidBound(link.fromNode)) {
                continue;
            }

            if (!this.isLoopBackPort(link.toPortId)) {
                if (this.isConditionalFalsePort(link.fromPortId)) {
                    if (this.isIfElseIfLink(link) || this.isElseLink(link) || this.isCatchNodeWithChildren(link.fromNode)) {
                        sideLink = link;
                    } else {
                        rightLinks.add(link);
                    }
                } else {
                    if (this.isFlowTriggerOrSubflowInputsOutputs(link.fromNode) || this.isPathBroken(link.fromNode)) {
                        // Trigger and PathBroken nodes are special case because
                        // their port size is incorrect. Should get it fixed!
                        verticalLink = link;
                    } else if (this.verticallyAligned(link, x)) {
                        verticalLink = link;
                    } else {
                        downLinks.add(link);
                    }
                }
            } else if (link.fromPortId === SYS_IDS.DIAGRAM_PORT_END_DO_LOOP_OUTPUT_LOOPBACK_SYS_ID && !sideLink) {
                sideLink = link;
            }
        }
        // sort down-link nodes from left to right
        downLinks.sort(function(l1, l2) {
            return l1.fromNode.actualBounds.x - l2.fromNode.actualBounds.x;
        });
        // sort right-link nodes from bottom to top
        rightLinks.sort(function(l1, l2) {
            return l2.fromNode.actualBounds.y - l1.fromNode.actualBounds.y;
        });

        var currentDownLink;
        var currentRightLink;
        var downLinkIt = downLinks.iterator;
        var rightLinkIt = rightLinks.iterator;
        if (downLinkIt.next()) {
            currentDownLink = downLinkIt.value;
        }
        if (rightLinkIt.next()) {
            currentRightLink = rightLinkIt.value;
        }
        while (currentDownLink || currentRightLink) {
            if (!currentDownLink) {
                currentRightLink = this.addToCustomLinks(customLinks, currentRightLink, rightLinkIt);
            } else if (!currentRightLink) {
                currentDownLink = this.addToCustomLinks(customLinks, currentDownLink, downLinkIt);
            } else {
                var currentGroupDimension = this.getNodeDimension(
                    currentRightLink.fromNode
                );
                if (currentGroupDimension) {
                    if (currentGroupDimension.containsRect(currentDownLink.fromNode.actualBounds)) {
                        currentDownLink = this.addToCustomLinks(customLinks, currentDownLink, downLinkIt);
                    } else if (
                        currentDownLink.fromNode.actualBounds.x + currentDownLink.fromNode.actualBounds.width < currentGroupDimension.x
                    ) {
                        currentDownLink = this.addToCustomLinks(customLinks, currentDownLink, downLinkIt);
                    } else {
                        currentRightLink = this.addToCustomLinks(customLinks, currentRightLink, rightLinkIt);
                    }
                } else { // we need to breakout of infinite loop
                    break;
                }
            }
        }
        return {
            customLinks: customLinks,
            verticalLink: verticalLink,
            sideLink: sideLink,
        };
    };

    FlowDiagramLayout.prototype.updateNodeY = function(verticalLink, customLinks, node, y, ignoreCustom) {
        var fromNodeY = 0;
        var toStageNode = false;
        if (this.isStageNode(node) && this.stageNodeAssociatedMap[node.key]) {
            var toNodeKey = this.stageNodeAssociatedMap[node.key];
            node = this._nodes.get(toNodeKey);
            toStageNode = true;
        }

        // If node is a GOBACK target then add height to the GOBACK edge
        if (this.isGoBackToTargetNode(node)) {
            y += LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_GOBACKTO_TARGET;
            if (toStageNode) {
                y += LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
            }
        }
        if (verticalLink && !this.isDecisionBlock(node)) {
            var verticalLinkFromNodeBoundary = verticalLink.fromNode.actualBounds;
            fromNodeY =
                verticalLinkFromNodeBoundary.y + verticalLinkFromNodeBoundary.height;
        } else {
            // End node blocks the vertical link
            // Get the previous sibling that is an IF node
            var previousSiblingAsIf;
            var previousSiblingAsDecision;
            var curr = node;
            while (true) {
                var previousSiblingId = this.getRelation(curr, "previousSibling");
                if (!previousSiblingId) {
                    break;
                }
                var previousSibling = this._nodes.get(previousSiblingId);
                if (!previousSibling) {
                    // hidden else node
                    previousSiblingId =
                        this._hiddenElseLinks.get(previousSiblingId).previousSibling;
                    previousSibling = this._nodes.get(previousSiblingId);
                } else {
                    if (this.isIfNode(previousSibling)) {
                        previousSiblingAsIf = previousSibling;
                        break;
                    }
                    if (this.isDecisionBlock(previousSibling)) {
                        previousSiblingAsDecision = previousSibling;
                        break;
                    }
                }
                curr = previousSibling;
            }
            if (previousSiblingAsIf) {
                var previousSiblingAsIfBoundary =
                    this.getNodeDimension(previousSiblingAsIf);
                if (previousSiblingAsIfBoundary) {
                    fromNodeY =
                        previousSiblingAsIfBoundary.y + previousSiblingAsIfBoundary.height;
                } else {
                    fromNodeY = y;
                }
            }
            if (previousSiblingAsDecision) {
                var previousSiblingAsDecisionBoundary =
                    this.getNodeDimension(previousSiblingAsDecision);
                if (previousSiblingAsDecisionBoundary) {
                    fromNodeY = previousSiblingAsDecisionBoundary.y;
                }
                return fromNodeY;
            } else if (this.fromStageNode(node, this.stageNodesMap)) {
                return y;
            }
        }
        var customLinksSize = customLinks.size;
        if (ignoreCustom) { // ignore custom link when link into is GoBackTo
            customLinksSize = 0;
        }
        y = Math.max(
            y,
            fromNodeY +
            LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK +
            (customLinksSize - 1) * LAYOUT_CONFIGURATION.EDGE_GAP +
            LAYOUT_CONFIGURATION.EDGE_GAP_LARGE
        );
        var linkIt = customLinks.iterator;
        while (linkIt.next()) {
            var index = linkIt.key;
            var link = linkIt.value;
            // if node is a GoBack target then source is below, we don't want to add this space above target
            if (!this.isGoBackToOutputPort(link.fromPortId)) {
                var fromNodeBoundary = link.fromNode.actualBounds;
                fromNodeY = fromNodeBoundary.y + fromNodeBoundary.height;
                y = Math.max(
                    y,
                    fromNodeY +
                    this.getLinkSegmentHeight(link) +
                    (customLinksSize - 1 - index) * LAYOUT_CONFIGURATION.EDGE_GAP +
                    LAYOUT_CONFIGURATION.EDGE_GAP_LARGE
                );
            }
        }
        if (this.isCatchNode(node)) {
            // add additional edge height for catch node
            y += LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_CATCH;
        }
        return y;
    };

    FlowDiagramLayout.prototype.updateLinkX = function(linkX, parentNodeGroupDim, largestSiblingBlockLinkX) {
        // when no siblings then just add x-axis HORIZONTAL GAP around parent block
        if (parentNodeGroupDim) {
            // add a RIGHT GAP point from GoBack Source Node
            linkX = parentNodeGroupDim.x + parentNodeGroupDim.width + LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
            if (linkX < largestSiblingBlockLinkX) {
                linkX = largestSiblingBlockLinkX;
            }
            return linkX;
        }
    };

    FlowDiagramLayout.prototype.hasNextSiblingWithChildren = function(node) {
        var nextSiblingKey = this.getRelation(node, "nextSibling");
        if (nextSiblingKey && !this.isEndNode(node)) {
            var nextSiblingNode = this._nodes.get(nextSiblingKey);
            var nextSiblingChildren = this.getRelation(nextSiblingNode, "children", []);
            if (nextSiblingChildren && nextSiblingChildren.length > 0) {
                return true;
            }
            // check if next sibling is ELSE block
            var sibElseNode = this._hiddenElseLinks.get(nextSiblingKey);
            if (sibElseNode && sibElseNode.children && sibElseNode.children.length > 0) {
                return true;
            }
            return this.hasNextSiblingWithChildren(nextSiblingNode);
        }
        return false;
    };

    // find largest sibling group to route down/around
    FlowDiagramLayout.prototype.findLargestSiblingGroup = function(parentKey, toNodParentKey) {
        var foundNode;
        var foundNodeGroupDimension;
        if (parentKey && parentKey !== toNodParentKey) {
            var parentParentNode = this._nodes.get(parentKey);
            if (this.isIfNode(parentParentNode) || this.isElseIfNode(parentParentNode)) {
                parentNodeGroupDim = this.getGroupDimensionByKey(parentParentNode.data.key);
                if (parentParentNode && parentParentNode.data.relation.nextSibling) {
                    var parentSibNode = this._nodes.get(parentParentNode.data.relation.nextSibling);
                    var parentSiblingNodeDimension = this.getNodeDimension(parentSibNode);
                    var parentNextSiblingKey = this.getRelation(parentParentNode, "nextSibling");
                    var parentSiblingGroupDimension = this.getGroupDimensionByKey(parentNextSiblingKey) || parentSiblingNodeDimension;
                    if (parentSibNode && parentSiblingGroupDimension) {
                        foundNode = parentSibNode;
                        foundNodeGroupDimension = parentSiblingGroupDimension;
                        return {
                            foundNode: foundNode,
                            foundNodeGroupDimension: foundNodeGroupDimension
                        };
                    }
                }
            } else if (this._hiddenElseLinks.get(parentKey)) {
                var elseChildren = this._hiddenElseLinks.get(parentKey).children;
                if (elseChildren && elseChildren.length > 0) {
                    nextSiblingKey = elseChildren[0];
                    nextSiblingNode = this._nodes.get(nextSiblingKey);
                    var parentSiblingNodeDimension = this.getNodeDimension(nextSiblingNode);
                    var parentSiblingGroupDimension = this.getGroupDimensionByKey(nextSiblingKey) || parentSiblingNodeDimension;
                    if (nextSiblingNode && parentSiblingGroupDimension) {
                        foundNode = nextSiblingNode;
                        foundNodeGroupDimension = parentSiblingGroupDimension;
                        return {
                            foundNode: foundNode,
                            foundNodeGroupDimension: foundNodeGroupDimension
                        };
                    }
                }
            }
        }
        return;
    };

    FlowDiagramLayout.prototype.getParentNode = function(node) {
        if (!node) {
            return;
        }
        var parentNodeKey = this.getRelation(node, "parent");
        if (parentNodeKey) {
            var parentNode = this._nodes.get(parentNodeKey);
            if (parentNode && parentNode.data) {
                return parentNode;
            }
            var parentElseNode = this._hiddenElseLinks.get(parentNodeKey);
            if (parentElseNode) {
                return parentElseNode;
            }
        }
        return;
    };

    FlowDiagramLayout.prototype.getAncestorIfNode = function(node) {
        if (!node) {
            return;
        }
        var parentNodeKey = this.getRelation(node, "parent");
        if (parentNodeKey) {
            var parentNode = this._nodes.get(parentNodeKey);
            if (parentNode && this.isElseIfNode(parentNode)) {
                var siblingKey = this.getRelation(parentNode, "previousSibling");
                parentNode = this._nodes.get(siblingKey);
                return this.getAncestorIfNode(parentNode);
            }
            // if parent node is not found, check for Else
            if (!parentNode) {
                var previousSiblingKey = this._hiddenElseLinks.get(parentNodeKey).parent; // previousSibling
                if (previousSiblingKey) {
                    parentNode = this._nodes.get(previousSiblingKey);
                }
            }
            if (this.isConditionalNode(parentNode)) {
                return this.getAncestorIfNode(parentNode);
            }
        }
        return node;
    };

    FlowDiagramLayout.prototype.getCurrentBlockIfNode = function(node) {
        if (!node) {
            return;
        }
        if (this.isIfNode(node)) {
            return node;
        }
        if (this.isElseIfNode(node) || this.isElseNodeKey(node.key)) {
            var previousSiblingKey = this.getRelation(node, "previousSibling");
            var sibNode = this._nodes.get(previousSiblingKey);
            return this.getCurrentBlockIfNode(sibNode);
        }
    };

    FlowDiagramLayout.prototype.addRoutePointsDownAround = function(node, parentNode, linkX, linkY, pointsToAdd, shouldAddY) {
        var parentNodeGroupDim = this.getGroupDimensionByKey(node.key || node.data.key);
        // if any siblings have children then route Y down the length of the parent group dimension
        if (parentNode && this.hasNextSiblingWithChildren(parentNode) && parentNodeGroupDim && shouldAddY) {
            linkY = parentNodeGroupDim.y + parentNodeGroupDim.height;
            pointsToAdd.push([linkX, linkY]);
        } else {
            // ElseIf/Else blocks have no siblings, add x-axis HORIZONTAL GAP around parent block
            pointsToAdd.push([linkX, linkY]);
        }

        // add x-axis HORIZONTAL GAP around parent block only if separate node
        if (parentNodeGroupDim && node !== parentNode) {
            linkX = parentNodeGroupDim.x + parentNodeGroupDim.width;
        }
        pointsToAdd.push([linkX, linkY]);
        return {
            x: linkX,
            y: linkY
        }
    };

    // Route edge down/around logic
    // this method will set 4 route points
    FlowDiagramLayout.prototype.routeDownAroundSiblingElseBlocks = function(fromNode, fromPosition, x, pointsToAdd, targetNode) {
        var linkX = x;
        var linkY = fromPosition.y;
        if (!this.hasParentDecisionBlock(fromNode, true)) {
            // check if we need to route edge down and around a sibling group
            // will be either IF, ELSEIF, ELSE
            var parentKey = this.getRelation(fromNode, "parent");
            var ancestorParentNode = this.getAncestorIfNode(fromNode);
            var parentNode = this.getParentNode(fromNode) || ancestorParentNode;
            var parentIfNodeKey = parentKey;
            var isElseBlock = this.isElseNodeKey(parentKey);
            var isCatchBlock = this.isCatchNode(parentNode);
            var skipElseBlock = false;
            if (isElseBlock) {
                var elseNode = this._hiddenElseLinks.get(parentKey);
                var parentIfNode = this.getCurrentBlockIfNode(elseNode);
                if (elseNode && parentIfNode.key) {
                    parentIfNodeKey = parentIfNode.key;
                }
                if (ancestorParentNode && ancestorParentNode.data.key === parentIfNodeKey) {
                    skipElseBlock = true;
                }
                if (targetNode && parentIfNodeKey === targetNode.key) {
                    skipElseBlock = true;
                }
            } else if (!isCatchBlock) {
                // route down and around any sibling elseif, else blocks in current IF block
                var topIfNode = this.getCurrentBlockIfNode(parentNode); // this.getAncestorIfNode(fromNode).data.name)
                // Previous we only routed down (shouldAddY) when targetNode.data.order >= topIfNode.data.order
                // this is not correct, if elseif or else have children we should always route down
                const shouldAddY = true;

                var newXnewY = this.addRoutePointsDownAround(topIfNode, parentNode, linkX, linkY, pointsToAdd, shouldAddY);
                linkX = newXnewY.x;
                linkY = newXnewY.y;
                // if target is outside of current IF block, also need to route down/around
                if (!targetNode || topIfNode.key !== targetNode.key) {
                    this.addRoutePointsDownAround(targetNode, targetNode, linkX, linkY, pointsToAdd, shouldAddY);
                }
            }

            if (targetNode && !skipElseBlock) { // route down and around any parent sibling elseif, else blocks
                this.addRoutePointsDownAround(targetNode, targetNode, linkX, linkY, pointsToAdd, false);
            }
        }
    };

    FlowDiagramLayout.prototype.findParentDecisionBlock = function(node) {
        var parentNode = this.getParentNode(node);
        if (!parentNode) {
            return false;
        }
        if (this.isDecisionBlock(parentNode)) {
            return parentNode;
        } else {
            return this.findParentDecisionBlock(parentNode);
        }
    };

    FlowDiagramLayout.prototype.hasParentDecisionBlock = function(node, onlyDirectParent) {
        var parentNode = this.getParentNode(node);
        if (!parentNode) {
            return false;
        }
        if (this.isDecisionBlock(parentNode)) {
            return true;
        } else if (onlyDirectParent) {
            return false;
        } else {
            return this.findParentDecisionBlock(parentNode);
        }
    };

    // if source is inside DECISION block
    // this method will set 2 route points
    FlowDiagramLayout.prototype.routeDownAroundDecisionBranches = function(fromNode, pointsToAdd) {
        var linkY = pointsToAdd[pointsToAdd.length - 1][1];
        var linkX;
        var parentDecisionNode = this.findParentDecisionBlock(fromNode);
        if (parentDecisionNode) {
            if (this.hasNextSiblingWithChildren(parentDecisionNode)) {
                var makeADecisionNode = this.getParentNode(parentDecisionNode);
                var decisionBranchGroupDim = this.getGroupDimensionByKey(parentDecisionNode) || this.getNodeDimension(parentDecisionNode);
                var decisionGroupDim = this.getGroupDimensionByKey(makeADecisionNode.key) || this.getNodeDimension(makeADecisionNode);
                if (decisionBranchGroupDim && decisionGroupDim) {
                    linkX = decisionBranchGroupDim.x + decisionBranchGroupDim.width + LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
                    pointsToAdd.push([linkX, linkY]);
                    linkY = decisionGroupDim.y + decisionGroupDim.height;
                    pointsToAdd.push([linkX, linkY]);
                }
            }
        }
    };

    // GoBackTo label position depends on all GoBackTo edges to have the same number of points
    FlowDiagramLayout.prototype.addExtraRoutePoints = function(pointsToAdd) {
        if (pointsToAdd.length < LAYOUT_CONFIGURATION.GOBACKTO_ROUTE_POINTS) {
            while (pointsToAdd.length < LAYOUT_CONFIGURATION.GOBACKTO_ROUTE_POINTS) {
                // add an extra of the last x,y points
                pointsToAdd.push(pointsToAdd[pointsToAdd.length - 1]);
            }
        }
    };

    FlowDiagramLayout.prototype.calculateGoBackToEdgePoints = function(link, fromPosition, linkX, linkY) {
        var pointsToAdd = [];
        // add edge point on the RIGHT of node (at fromPort)
        pointsToAdd.push([fromPosition.x, fromPosition.y]);
        // add a RIGHT GAP (x-axis) point from GoBackTo source node
        linkX = fromPosition.x + LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
        pointsToAdd.push([linkX, fromPosition.y]);

        var linkXoriginal = linkX;
        var largestSiblingBlockLinkX = 0;
        var fromNode = link.fromNode;
        var toNode = link.toNode;
        var toNodeKey = toNode.data.key;
        var largestSibKey = largestSibKey;
        var largestSibNodeGroupDim;
        var largestSibNode = toNode;

        if (this.isStageNode(toNode) && this.stageNodeAssociatedMap[toNode.key]) {
            toNodeKey = this.stageNodeAssociatedMap[toNode.key];
            toNode = this._nodes.get(toNodeKey);
        }

        /*
            Find largest group dimension width between siblings, starting with GOBACK TARGET to logic block that contains GOBACK SOURCE
            this.targetSiblingMap[toNodeKey] - array of sibling nodes starting with Target to logic block that contains Source
            Note: GOBACK edges should only merge when going back to same TARGET
            edges that wrap around the same logic block (ie. SOURCE has same ANCESTOR) should be spaced appart
        */
        if (this.targetSiblingMap[toNodeKey]) {
            var siblingKeys = this.targetSiblingMap[toNodeKey];
            for (var i = 0; i < siblingKeys.length; i++) {
                var sibKey = siblingKeys[i];
                var sibNode = this._nodes.get(sibKey);
                if (sibNode) {
                    var sibNodeDimension = this.getNodeDimension(sibNode);
                    var sibNodeGroupDim = this.getGroupDimensionByKey(sibKey) || sibNodeDimension;
                    if (sibNodeGroupDim) {
                        var sibx = sibNodeGroupDim.x || 0;
                        var sibw = sibNodeGroupDim.width || 0;
                        var sibX = sibx + sibw;
                        if (sibX > largestSiblingBlockLinkX) {
                            largestSiblingBlockLinkX = sibX;
                            largestSibKey = sibKey;
                            largestSibNodeGroupDim = sibNodeGroupDim;
                            largestSibNode = sibNode;
                        }
                    }
                }
            }
            // increase the group boundary to include the GOBACK edge around
            if (this.isLogicBlockNode(largestSibNode)) {
                if (largestSibKey && largestSibNodeGroupDim && !this.targetHasGoBackEdge[toNodeKey]) {
                    largestSibNodeGroupDim.width += LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
                    largestSibNodeGroupDim.height += LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
                    largestSiblingBlockLinkX += LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
                    this.setGroupDimensionByKey(largestSibKey, largestSibNodeGroupDim);
                    this.targetHasGoBackEdge[toNodeKey] = true;
                }
            }
        }

        var topParentNode = largestSibNode;
        if (this.isDecisionNode(largestSibNode)) {
            topParentNode = this.getParentNode(fromNode);
        }
        this.routeDownAroundSiblingElseBlocks(fromNode, fromPosition, linkX, pointsToAdd, topParentNode);
        this.routeDownAroundDecisionBranches(fromNode, pointsToAdd);
        this.addExtraRoutePoints(pointsToAdd);

        linkX = pointsToAdd[pointsToAdd.length - 1][0];
        linkY = pointsToAdd[pointsToAdd.length - 1][1];

        // ADD THE x-axis HORIZONTAL GAP - based on GOBACK TARGET BLOCK
        // point around the TARGET block
        var toNodeDimension = this.getNodeDimension(largestSibNode);
        var toNodeGroupDim = this.getGroupDimensionByKey(largestSibKey) || toNodeDimension || 0;
        var linkXofLargestGroup = linkXoriginal;

        // get group boundary of target (to) node, adjust edge x outside the boundary, set y to node y
        if (toNodeGroupDim) {
            linkXofLargestGroup = toNodeGroupDim.x + toNodeGroupDim.width;
            if (this.isDecisionNode(largestSibNode)) {
                linkXofLargestGroup += LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
            }
            if (linkXofLargestGroup < largestSiblingBlockLinkX) {
                linkXofLargestGroup = largestSiblingBlockLinkX;
            }
        }

        // go outside group block X
        if (linkXofLargestGroup) {
            pointsToAdd.push([linkXofLargestGroup, linkY]);
        } else {
            pointsToAdd.push([linkX, linkY]);
        }
        return pointsToAdd;
    };

    FlowDiagramLayout.prototype.routeLinks = function(linksIntoResult, horizontalY, sortByOrder) {
        var fromNodeBoundary;
        var fromPortBoundary;
        var toNodeBoundary;
        var toPortBoundary;
        var fromPosition;
        var toPosition;
        if (linksIntoResult.verticalLink) {
            try {
                fromNodeBoundary = linksIntoResult.verticalLink.fromNode.actualBounds;
                fromPortBoundary = linksIntoResult.verticalLink.fromPort.actualBounds;
                toNodeBoundary = linksIntoResult.verticalLink.toNode.actualBounds;
                toPortBoundary = linksIntoResult.verticalLink.toPort.actualBounds;
                if (
                    fromNodeBoundary &&
                    fromPortBoundary &&
                    toNodeBoundary &&
                    toPortBoundary
                ) {
                    var vpts = linksIntoResult.verticalLink.points.copy();
                    vpts.clear();
                    fromPosition = this.getBottomPosition(fromNodeBoundary, fromPortBoundary);
                    toPosition = this.getTopPosition(toNodeBoundary, toPortBoundary);
                    if (
                        this.isFlowTriggerOrSubflowInputsOutputs(linksIntoResult.verticalLink.fromNode) ||
                        this.isPathBroken(linksIntoResult.verticalLink.fromNode)
                    ) {
                        // Trigger and PathBroken nodes are special case because
                        // their port size is incorrect. Should get it fixed!
                        fromPosition.x = toPosition.x;
                    }
                    vpts.add(new go.Point(fromPosition.x, fromPosition.y));
                    vpts.add(new go.Point(toPosition.x, toPosition.y));
                    linksIntoResult.verticalLink.points = vpts;
                }
            } catch (error) {}
        }
        if (linksIntoResult.sideLink) {
            try {
                fromNodeBoundary = linksIntoResult.sideLink.fromNode.actualBounds;
                fromPortBoundary = linksIntoResult.sideLink.fromPort.actualBounds;
                toNodeBoundary = linksIntoResult.sideLink.toNode.actualBounds;
                toPortBoundary = linksIntoResult.sideLink.toPort.actualBounds;
                if (
                    fromNodeBoundary &&
                    fromPortBoundary &&
                    toNodeBoundary &&
                    toPortBoundary
                ) {
                    var spts = linksIntoResult.sideLink.points.copy();
                    spts.clear();
                    fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                    toPosition = this.getTopPosition(toNodeBoundary, toPortBoundary);
                    spts.add(new go.Point(fromPosition.x, fromPosition.y));
                    spts.add(new go.Point(toPosition.x, fromPosition.y));
                    spts.add(new go.Point(toPosition.x, toPosition.y));
                    linksIntoResult.sideLink.points = spts;
                }
            } catch (error) {}
        }
        var customLinks = linksIntoResult.customLinks;
        if (sortByOrder) {
            customLinks = customLinks.sort(function(a, b) {
                if (a.data.order > b.data.order) {
                    return -1;
                } else if (a.data.order < b.data.order) {
                    return 1;
                }
                return 0;
            });
        }

        var linkIt = customLinks.iterator;
        var linkX;
        var linkY;
        while (linkIt.next()) {
            var index = linkIt.key;
            var link = linkIt.value;
            if (link && link.fromNode) {
                fromNodeBoundary = link.fromNode.actualBounds;
                fromPortBoundary = link.fromPort.actualBounds;
                toNodeBoundary = link.toNode.actualBounds;
                toPortBoundary = link.toPort.actualBounds;
                if (
                    fromNodeBoundary &&
                    fromPortBoundary &&
                    toNodeBoundary &&
                    toPortBoundary
                ) {
                    var pts = link.points.copy();
                    pts.clear();
                    if (this.isConditionalFalsePort(link.fromPortId) || this.isBreakPort(link.fromPortId)) {
                        fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                        pts.add(new go.Point(fromPosition.x, fromPosition.y));
                        var groupDimension = this.getNodeDimension(link.fromNode);
                        if (groupDimension) {
                            linkX = groupDimension.x + groupDimension.width;
                            pts.add(new go.Point(linkX, fromPosition.y));
                        }
                    } else if (this.isGoBackToOutputPort(link.fromPortId) && sortByOrder) {
                        if (this.invalidBound(link.fromNode)) {
                            return;
                        } else {
                            // set from node point (GOBACK source node)
                            fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                            linkY = fromPosition.y;

                            var pointsToAdd = this.calculateGoBackToEdgePoints(link, fromPosition, linkX, linkY);
                            this.addExtraRoutePoints(pointsToAdd);
                            pointsToAdd.forEach(function(a, i) {
                                pts.add(new go.Point(a[0], a[1]));
                            });
                            // update our x, y based on last points added
                            linkX = pointsToAdd[pointsToAdd.length - 1][0];
                            linkY = pointsToAdd[pointsToAdd.length - 1][1];
                        }
                    } else {
                        fromPosition = this.getBottomPosition(fromNodeBoundary, fromPortBoundary);
                        linkX = fromPosition.x;
                        pts.add(new go.Point(linkX, fromPosition.y));
                    }
                    // parallel branch edges will all have the same y-axis
                    if (horizontalY || this.isBreakNode(link.fromNode)) {
                        linkY =
                            toNodeBoundary.y - (customLinks.size) - LAYOUT_CONFIGURATION.EDGE_GAP - LAYOUT_CONFIGURATION.EDGE_GAP_LARGE;
                    } else {
                        linkY =
                            toNodeBoundary.y - (customLinks.size - 1 - index) * LAYOUT_CONFIGURATION.EDGE_GAP - LAYOUT_CONFIGURATION.EDGE_GAP_LARGE;
                    }
                    pts.add(new go.Point(linkX, linkY));
                    toPosition = this.getTopPosition(toNodeBoundary, toPortBoundary);
                    pts.add(new go.Point(toPosition.x, linkY));
                    pts.add(new go.Point(toPosition.x, toPosition.y));
                    link.points = pts;
                }
            }
        }
    };

    // traverse up till we find the sibling node of a parent
    FlowDiagramLayout.prototype.findAllParents = function(node, parentList) {
        if (!node) {
            return parentList;
        }

        if (node.data.parent) {
            parentList.push({
                key: node.data.parent,
                parentKey: node.data.parent
            });
        }
        var parentNode = this._nodes.get(node.data.parent);
        return this.findAllParents(parentNode, parentList);
    };

    // return additional x-axis spacing based on GOBACK targets inside the conditional block
    FlowDiagramLayout.prototype.additionalGoBackEdgeSpacing = function(sourceNodeKey) {
        // number of GOBACK targets inside the conditional block
        var goBackAdditionalGap = 0;
        if (sourceNodeKey) {
            if (this.goBackToEdgesToProcess[sourceNodeKey]) {
                var edgeCount = this.goBackToEdgesToProcess[sourceNodeKey];
                goBackAdditionalGap = LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO * edgeCount;
                // this is used to notify when children are done processing that boundary will need extra space for the GOBACK edge
                this.additionalGoBackToWidth = goBackAdditionalGap;
            }
        }
        return goBackAdditionalGap;
    };

    FlowDiagramLayout.prototype.updateBackLink = function(link, additional, isHorizontal) {
        var GAP_ADDITIONAL = additional || 0;
        if (this.invalidBound(link.fromNode) || this.invalidBound(link.toNode)) {
            return;
        }
        var fromNodeBoundary = link.fromNode.actualBounds;
        var fromPortBoundary = link.fromPort.actualBounds;
        var toNodeBoundary = link.toNode.actualBounds;
        var toPortBoundary = link.toPort.actualBounds;
        var loopBoundary = this.getNodeDimension(link.toNode);
        if (
            fromNodeBoundary &&
            fromPortBoundary &&
            toNodeBoundary &&
            toPortBoundary &&
            loopBoundary
        ) {
            var pts = link.points.copy();
            pts.clear();
            var fromPosition = this.getBottomPosition(fromNodeBoundary, fromPortBoundary);
            var yGap = LAYOUT_CONFIGURATION.EDGE_GAP;
            if (isHorizontal) {
                fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                yGap = 0;
            }
            pts.add(new go.Point(fromPosition.x, fromPosition.y));
            var linkY = fromPosition.y + yGap;
            pts.add(new go.Point(fromPosition.x, linkY));
            var linkX = loopBoundary.x + loopBoundary.width + GAP_ADDITIONAL;
            pts.add(new go.Point(linkX, linkY));
            var toPosition = this.getRightPosition(toNodeBoundary, toPortBoundary);
            pts.add(new go.Point(linkX, toPosition.y));
            pts.add(new go.Point(toPosition.x, toPosition.y));
            link.points = pts;
        }
    };

    FlowDiagramLayout.prototype.createContinueLink = function(link) {
        if (this.invalidBound(link.fromNode) || this.invalidBound(link.toNode)) {
            return;
        }
        var fromNodeBoundary = link.fromNode.actualBounds;
        var fromPortBoundary = link.fromPort.actualBounds;
        var toNodeBoundary = link.toNode.actualBounds;
        var toPortBoundary = link.toPort.actualBounds;
        var loopBoundary = this.getNodeDimension(link.toNode);
        if (
            fromNodeBoundary &&
            fromPortBoundary &&
            toNodeBoundary &&
            toPortBoundary &&
            loopBoundary
        ) {
            var pts = link.points.copy();
            pts.clear();
            fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
            var pointsToAdd = [];
            //initial routing points
            pointsToAdd.push([fromPosition.x, fromPosition.y]);
            var linkX = fromPosition.x + LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
            pointsToAdd.push([linkX, fromPosition.y]);

            //routing down from else-if, if or decision
            this.routeDownAroundSiblingElseBlocks(link.fromNode, fromPosition, linkX, pointsToAdd, link.toNode);
            this.routeDownAroundDecisionBranches(link.fromNode, pointsToAdd);
            linkX = loopBoundary.x + loopBoundary.width;
            var linkY = pointsToAdd[pointsToAdd.length - 1][1];
            pointsToAdd.push([linkX, linkY]);

            //final routing points
            var toPosition = this.getRightPosition(toNodeBoundary, toPortBoundary);
            pointsToAdd.push([linkX, toPosition.y]);
            pointsToAdd.push([toPosition.x, toPosition.y]);
            pointsToAdd.forEach(function(a, i) {
                pts.add(new go.Point(a[0], a[1]));
            });
            link.points = pts;
        }
    };

    FlowDiagramLayout.prototype.createBreakLink = function(link) {
        if (this.invalidBound(link.fromNode) || this.invalidBound(link.toNode)) {
            return;
        }
        var parentloopKey = link.fromNode.data.data.parent_loop.key;
        var loopNode = this._nodes.get(parentloopKey);

        var fromNodeBoundary = link.fromNode.actualBounds;
        var fromPortBoundary = link.fromPort.actualBounds;
        var toNodeBoundary = link.toNode.actualBounds;
        var toPortBoundary = link.toPort.actualBounds;
        var loopBoundary = this.getNodeDimension(loopNode);
        if (
            fromNodeBoundary &&
            fromPortBoundary &&
            toNodeBoundary &&
            toPortBoundary &&
            loopBoundary
        ) {
            var pts = link.points.copy();
            pts.clear();
            fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
            var pointsToAdd = [];
            //initial routing points
            pointsToAdd.push([fromPosition.x, fromPosition.y]);
            var linkX = fromPosition.x + LAYOUT_CONFIGURATION.EDGE_GAP_GOBACKTO;
            pointsToAdd.push([linkX, fromPosition.y]);

            //routing down from else-if, if or decision
            this.routeDownAroundSiblingElseBlocks(link.fromNode, fromPosition, linkX, pointsToAdd, link.toNode);
            this.routeDownAroundDecisionBranches(link.fromNode, pointsToAdd);
            var goBackAdditionalGap = this.additionalGoBackEdgeSpacing(parentloopKey);
            linkX = loopBoundary.x + loopBoundary.width + LAYOUT_CONFIGURATION.EDGE_GAP + goBackAdditionalGap;
            var linkY = pointsToAdd[pointsToAdd.length - 1][1];
            pointsToAdd.push([linkX, linkY]);

            //final routing points
            var toPosition = this.getTopPosition(toNodeBoundary, toPortBoundary);
            pointsToAdd.push([linkX, toPosition.y - LAYOUT_CONFIGURATION.EDGE_GAP - LAYOUT_CONFIGURATION.EDGE_GAP_LARGE]);
            pointsToAdd.push([toPosition.x, toPosition.y - LAYOUT_CONFIGURATION.EDGE_GAP - LAYOUT_CONFIGURATION.EDGE_GAP_LARGE]);
            pointsToAdd.push([toPosition.x, toPosition.y]);
            pointsToAdd.forEach(function(a, i) {
                pts.add(new go.Point(a[0], a[1]));
            });
            link.points = pts;
        }
    };

    // Reverse traversal of node tree to assign additional widths to parent and previousSibling nodes
    FlowDiagramLayout.prototype.setParentAdditionalXAxis = function(node, groupBoundaryWidth, nodeDimensionWidth) {
        // look for parent first - if no parent, skip this entirely
        var parentNodeKey = this.getRelation(node, "parent");
        if (parentNodeKey) {
            var parentNode = this._nodes.get(parentNodeKey);
            if (parentNode && !this.isCatchNode(parentNode)) {
                this.nodeCenterAlignAdditionalXAxisMap[parentNodeKey] = (groupBoundaryWidth / 2) - (nodeDimensionWidth / 2);
                this.setParentAdditionalXAxis(parentNode, groupBoundaryWidth, nodeDimensionWidth);
            }

            // a sibling here would share the same parent
            // ex. the "false" branch of a conditional node needs to adjust the width if there is a DoParallel in any
            // the "true" children or any of the "false" siblings
            var previousSiblingNodeKey = this.getRelation(node, "previousSibling");
            var previousSiblingNode = this.diagram.findNodeForKey(previousSiblingNodeKey);
            if (previousSiblingNode) {
                this.nodeCenterAlignAdditionalXAxisMap[previousSiblingNodeKey] = (groupBoundaryWidth / 2) - (nodeDimensionWidth / 2);
                var siblingNode = this._nodes.get(previousSiblingNodeKey);
                if (siblingNode) {
                    this.setParentAdditionalXAxis(siblingNode, groupBoundaryWidth, nodeDimensionWidth);
                }
            }
        }
    };

    FlowDiagramLayout.prototype.adjustNextNodeYAxis = function(currNode, nextNode, y) {
        var d = this.getNodeDimension(currNode) || currNode.actualBounds;
        y = d.y + d.height + this.getLinkHeightToNode(nextNode, this.x);
        return y;
    };

    // returns input node's first ancestor node that is either Parallel Block or Decision Block
    FlowDiagramLayout.prototype.getAncestorBlockNode = function(node) {
        if (node && node.data && node.data.parent) {
            var currentNode = this._nodes.get(node.data.parent);
            var previousKeys = {};
            previousKeys[node.key] = true;
            while (currentNode) {
                if (previousKeys[currentNode.key])
                    return null;
                previousKeys[currentNode.key] = true;
                if (this.isParallelBlock(currentNode) || this.isDecisionBlock(currentNode))
                    return currentNode;
                if (currentNode && currentNode.data && currentNode.data.parent) {
                    currentNode = this._nodes.get(currentNode.data.parent);
                } else {
                    return null;
                }
            }
        }
        return null;
    };

    FlowDiagramLayout.prototype.moveNodeTo = function(node, x, y) {
        if (node) {
            // if the node is ENDIF node and there was a processing of nodes on ELSEIF or ELSE branch because
            // of a stage node within the branch, then increase the y position of the ENDIF node because the node boundaries
            // on the IF branch are calculated after the calculations in ELSEIF or ELSE branch which causes the ENDIF node's
            // y position to be less than what is needed
            if (this.isEndIf(node) && node.data && node.data[SOURCE_NODE_KEYS.SOURCE_IF] && this.ifWithElseIforElse[node.data[SOURCE_NODE_KEYS.SOURCE_IF]]) {
                node.moveTo(x - node.actualBounds.width / 2, y + LAYOUT_CONFIGURATION.IF_WITH_ELSE_OR_ELSE_IF_OFFSET);
            } else {
                var newX = x - (node.actualBounds.width / 2);
                // DEF0367718: instead of blindly moving the node, check if the position will actually change
                // If x/y are both same, we would be asking the diagram to move the node to its same position, which somehow gets the node "stuck"
                if (newX !== node.actualBounds.x || y !== node.actualBounds.y) {
                    node.moveTo(newX, y);
                }
            }
        }
    };

    // processes nextNode and possibly its siblings if it is a stage node
    FlowDiagramLayout.prototype.processStageNodeOnIfElseIfOrElseLink = function(fromNode, nextNode, x, y) {
        var result;
        if (nextNode, fromNode, this.isStageNode(nextNode)) {
            if (this.isIfNode(fromNode)) {
                if (fromNode.data && fromNode.data.key) {
                    this.ifWithElseIforElse[fromNode.data.key] = true;
                }
            } else if (this.isElseIfNode(fromNode)) {
                var siblingNode = fromNode;
                // iterate through previous sibling to reach if node
                while (this.isElseIfNode(siblingNode)) {
                    var previousSiblingNodeKey = this.getRelation(siblingNode, "previousSibling");
                    if (previousSiblingNodeKey) {
                        siblingNode = this._nodes.get(previousSiblingNodeKey);
                    }
                }
                if (this.isIfNode(siblingNode)) {
                    if (siblingNode.data && siblingNode.data.key) {
                        this.ifWithElseIforElse[siblingNode.data.key] = true;
                    }
                }
            }
            result = this.processRootLevelNodes(nextNode, x, y);
        }
        return result;
    };

    FlowDiagramLayout.prototype.renderParallelBranch = function(link, parallelX, parallelY, boundaryWidth, groupBoundaryBegin, node, returnedNextNodeLoop, firstBranchX, lastBranchX) {
        if (link) {
            var index = this.getNodeIndex(link);
            // each parallel block will start at the x-axis of the previous node boundary width
            parallelX = this.calculateBlockXAxis(parallelX, boundaryWidth, index);
            // if we have children ensure parent relation has been set
            var toNode = link.toNode;
            if (toNode && toNode.data) {
                if (!toNode.data.relation) {
                    toNode.data.relation = {};
                }
                toNode.data.relation.parent = node.data.key;
            }
            if (this.isStageNode(toNode) && this.stageNodeAssociatedMap[toNode.key]) {
                var toNodeKey = this.stageNodeAssociatedMap[toNode.key];
                toNode = this._nodes.get(toNodeKey);
            }
            // render parallel branch children
            var result = this.renderChildrenHorizontal(parallelX, parallelY, link, groupBoundaryBegin);
            // union with block dimension
            var blockBoundary = this.getNodeDimension(toNode);
            if (blockBoundary) {
                var groupBoundaryBeginCopy = groupBoundaryBegin.copy();
                groupBoundaryBegin = groupBoundaryBeginCopy.unionRect(blockBoundary);
                // update width based on branch block width
                boundaryWidth = blockBoundary.width;
                // capture first and last branch x-axis so we can use to center
                if (firstBranchX === 0) {
                    firstBranchX = blockBoundary.x;
                }
                lastBranchX = blockBoundary.x;
            }
            // only attempt to grab the next node if we haven't already found the endParallel node
            if (!this.isEndParallel(returnedNextNodeLoop) || !this.isEndDecision(returnedNextNodeLoop)) {
                returnedNextNodeLoop = result.nextNode;
            }
        }
        return {
            parallelX: parallelX,
            boundaryWidth: boundaryWidth,
            groupBoundaryBegin: groupBoundaryBegin,
            firstBranchX: firstBranchX,
            lastBranchX: lastBranchX,
            returnedNextNodeLoop: returnedNextNodeLoop
        };
    };

    FlowDiagramLayout.prototype.getNextSiblingOutOfIf = function(node) {
        if (this.isIfNode(node)) {
            var nextSiblingId;
            while (true) {
                nextSiblingId = this.getRelation(node, "nextSibling");
                if (!nextSiblingId) {
                    break;
                }
                var nextSibling = this._nodes.get(nextSiblingId);
                if (!nextSibling) {
                    // hidden else node
                    nextSiblingId =
                        this._hiddenElseLinks.get(nextSiblingId).nextSibling;
                    break;
                } else {
                    if (!this.isIfNode(nextSibling) && !this.isElseIfNode(nextSibling)) {
                        break;
                    }
                }
                node = nextSibling;
            }
            return nextSiblingId;
        } else {
            return this.getRelation(node, "nextSibling");
        }
    };

    FlowDiagramLayout.prototype.renderSiblings = function(x, y, node) {
        var nextNode = this.walk(node, x, y);
        var boundary = this.getNodeDimension(node);

        while (true) {
            var nextSibling = this.getNextSiblingOutOfIf(node);
            if (!nextNode || nextNode.data.key !== nextSibling) {
                break;
            }
            node = nextNode;
            var linkHeight = this.getLinkHeightToNode(node, x);
            nextNode = this.walk(node, x, y + boundary.height + linkHeight);
            boundary = boundary.unionRect(this.getNodeDimension(node));
        }
        return {
            nextNode: nextNode,
            boundary: boundary,
        };
    };

    FlowDiagramLayout.prototype.moveStageNode = function(nextNextNode, nextNode) {
        // moves nextNextNode if it ia stage node and nextNode is not invalidBound()
        if (this.isStageNode(nextNextNode) && nextNode && nextNode.actualBounds && !this.invalidBound(nextNode)) {
            var nextX = nextNode.actualBounds.x + LAYOUT_CONFIGURATION.NODE_GAP_HORIZONTAL_STAGE;
            var nextY = nextNode.actualBounds.y + nextNode.actualBounds.height + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_WITH_LABEL;
            nextNextNode.moveTo(nextX, nextY);
        }
    };

    // only IF and ELSEIF can have sibling
    FlowDiagramLayout.prototype.renderElseSibling = function(x, y, link, boundary) {
        var fromNode = link.fromNode;
        var nodeHeight = fromNode.actualBounds.height;
        var nextNode = link.toNode;
        this.updateStageNodeRelation(nextNode);
        x += boundary.width + LAYOUT_CONFIGURATION.NODE_GAP_HORIZONTAL;
        y += nodeHeight / 2 + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        if (fromNode && this.nodeCenterAlignAdditionalXAxisMap[fromNode.data.key]) {
            x -= this.nodeCenterAlignAdditionalXAxisMap[fromNode.data.key];
        }
        if (nextNode && this.nodeCenterAlignAdditionalXAxisMap[nextNode.data.key]) {
            x += this.nodeCenterAlignAdditionalXAxisMap[nextNode.data.key];
        }
        var result;
        if (this.isIfElseIfLink(link)) {
            var nextNextNode = this.walk(nextNode, x, y);
            this.updateStageNodeRelation(nextNextNode);
            this.moveStageNode(nextNextNode, nextNode);
            boundary = boundary.unionRect(this.getNodeDimension(nextNode));
            nextNode = nextNextNode;
            result = this.processStageNodeOnIfElseIfOrElseLink(fromNode, nextNode, x, y);
            if (result) {
                nextNode = result.nextNode;
            }
        } else if (this.isElseLink(link) || this.isCatchNodeWithChildren(link.fromNode)) {
            result = this.renderSiblings(x, y, nextNode);
            this.updateStageNodeRelation(result.nextNode);
            if (result) {
                this.moveStageNode(result.nextNode, nextNode);
            }
            boundary = boundary.unionRect(result.boundary);
            nextNode = result.nextNode;
            result = this.processStageNodeOnIfElseIfOrElseLink(fromNode, nextNode, x, y);
            if (result) {
                nextNode = result.nextNode;
            }
        } else {
            boundary.width += LAYOUT_CONFIGURATION.EDGE_STICK_OUT_RIGHT;
        }
        return {
            nextNode: nextNode,
            boundary: boundary,
        };
    };

    FlowDiagramLayout.prototype.isInCurrentChildren = function(currentChildren, prop) {
        return prop && currentChildren.indexOf(prop) !== -1;
    };

    FlowDiagramLayout.prototype.isRelatedToCurrentChildren = function(nextNode, currentChildren) {
        if (!nextNode || !currentChildren) {
            return false;
        }
        if (this.isInCurrentChildren(currentChildren, nextNode.data.key)) {
            return true;
        }
        var propsToCheck = [];
        if (nextNode.data) {
            propsToCheck.push(nextNode.data.endParallelNodeKey);
            propsToCheck.push(nextNode.data.endDecisionNodeKey);
            if (nextNode.data.relation) {
                propsToCheck.push(nextNode.data.relation.parent);
                propsToCheck.push(nextNode.data.relation.nextSibling);
            }
        }
        for (var i = 0; i < propsToCheck.length; i++) {
            if (this.isInCurrentChildren(currentChildren, propsToCheck[i])) {
                return true;
            }
        }
        return false;
    };

    FlowDiagramLayout.prototype.isAssociatedStageNode = function(nextNode, stageNodeAssociatedMap, currentChildren) {
        return this.isStageNode(nextNode) && currentChildren.indexOf(stageNodeAssociatedMap[nextNode.data.key]) !== -1;
    };

    FlowDiagramLayout.prototype.renderChildren = function(x, y, link, boundary) {
        var currentChildren = this.getRelation(link.fromNode, "children", []);
        var nextNode = link.toNode;
        var linkHeight = this.getLinkHeight(link);
        while (this.isRelatedToCurrentChildren(nextNode, currentChildren) ||
            this.isAssociatedStageNode(nextNode, this.stageNodeAssociatedMap, currentChildren)) {
            isOneToManyAndInner = this.isOneToManyFlowLogic(nextNode) && nextNode.data && nextNode.data.parent;
            // x position will be properly adjusted if isOneToManyAndInner
            var childY = y + boundary.height + linkHeight;
            var nextNextNode = this.walk(
                nextNode,
                x,
                childY,
                isOneToManyAndInner && this.preprocessFlag
            );
            var nodeDim = this.getNodeDimension(nextNode);
            boundary = boundary.unionRect(nodeDim);
            // GOBACKTO edge was added so increase group width
            if (this.additionalGoBackToWidth) {
                var additionalWidth = this.additionalGoBackToWidth;
                boundary.width += additionalWidth;
                this.additionalGoBackToWidth = false;
            }
            nextNode = nextNextNode;
            linkHeight = this.getLinkHeightToNode(nextNode, x);
        }
        return {
            nextNode: nextNode,
            boundary: boundary,
        };
    };

    // Do the following in Parallel and Make a decision will render children horizontally
    FlowDiagramLayout.prototype.renderChildrenHorizontal = function(x, y, link, boundary) {
        var currentChildren = this.getRelation(link.fromNode, "children", []);
        var nextNode = link.toNode;
        var nextNextNode;
        while (nextNode && (currentChildren.indexOf(nextNode.data.key) !== -1 ||
                (this.isStageNode(nextNode) && currentChildren.indexOf(this.stageNodeAssociatedMap[nextNode.data.key]) !== -1))) {
            if (nextNode.data.extraXOffset) {
                x += nextNode.data.extraXOffset;
                nextNode.data.extraXOffset = 0;
            }
            var nextBoundary;
            if (this.isStageNode(nextNode)) {
                var afterStageNode;
                var stageDim = nextNode.actualBounds.copy();
                y = y - LAYOUT_CONFIGURATION.STAGE_TOP_OFFSET;
                afterStageNode = this.walk(
                    nextNode,
                    x,
                    y
                );
                // adjust y-axis
                y = y + stageDim.height + LAYOUT_CONFIGURATION.STAGE_VERTICAL_LINK;
                nextNextNode = this.walk(
                    afterStageNode,
                    x,
                    y
                );
                nextBoundary = this.getNodeDimension(afterStageNode);
                boundary.width = nextBoundary.width;
                nextNode = nextNextNode;
            } else {
                nextNextNode = this.walk(
                    nextNode,
                    x,
                    y
                );
                nextBoundary = this.getNodeDimension(nextNode);
                boundary.width = nextBoundary.width;
                nextNode = nextNextNode;
            }
        }
        // set the parallel block end edge height
        boundary.height += LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        return {
            nextNode: nextNode,
            boundary: boundary,
        };
    };

    // capture sibling nodes between target and source, based on the parent level of target
    // need this to determine the largest block need to calculate GOBACK source x
    FlowDiagramLayout.prototype.recursiveCaptureSiblings = function(key, targetKey, lastKey) {
        var node = this._nodes.get(key);
        if (!key || !node || !targetKey) {
            return;
        }
        // capture
        if (!this.targetSiblingMap[targetKey]) {
            this.targetSiblingMap[targetKey] = [];
            // include target node
            this.targetSiblingMap[targetKey].push(key);
        }
        // if we are at the source block then stop
        if (key === lastKey) {
            return;
        }
        if (node.data && node.data.relation && node.data.relation.nextSibling) {
            var nextSiblingKey = node.data.relation.nextSibling;
            if (!this.targetSiblingMap[targetKey].includes(nextSiblingKey)) {
                this.targetSiblingMap[targetKey].push(nextSiblingKey);
            }
            return this.recursiveCaptureSiblings(nextSiblingKey, targetKey, lastKey);
        }
    };

    // traverse up till we find the parent of GOBACK source node that matches the GOBACK target parent
    FlowDiagramLayout.prototype.findSourceNodeParentMatchingTargetScope = function(node, parentKey) {
        if (!node || !node.data) {
            return "";
        }

        var nodeParent = node.data.parent;
        if (nodeParent === parentKey && !this.isElseIfNode(node)) {
            return node.data.key; // we found a sibling of parent
        }
        // check if parent is ELSE, if so set to previousSibling
        var parentNode = this._nodes.get(nodeParent);
        if (this._hiddenElseLinks.get(nodeParent) && !this.isIfNode(parentNode) && !this.isIfNode(node)) {
            nodeParent = this._hiddenElseLinks.get(nodeParent).previousSibling;
        }
        if (this.isElseIfNode(node)) {
            nodeParent = node.data.relation.previousSibling;
        }
        return this.findSourceNodeParentMatchingTargetScope(parentNode, parentKey);
    };

    // GOBACKTO we need to capture linksOutOf that go back to target node for later routing
    FlowDiagramLayout.prototype.captureGoBackToEdges = function(node) {
        var linkOutOf = node.findLinksOutOf();
        while (linkOutOf.next()) {
            var link = linkOutOf.value;
            if (link && link.data && link.data.to) {
                var toNode = this._nodes.get(link.data.to);
                if (!toNode) { // handle if toNode is Stage
                    if (this.stageNodeAssociatedMap[link.data.to]) {
                        toNode = this._nodes.get(this.stageNodeAssociatedMap[link.data.to]);
                    } else {
                        return;
                    }
                }
                // capture Target node order to sort edges desc so we can process bottom up
                link.data.order = toNode.data.order;
                this.goBackToFromLinks.add(link);
            }
        }
    };

    FlowDiagramLayout.prototype.captureBreakContinueEdges = function(node) {
        var linkOutOf = node.findLinksOutOf();
        while (linkOutOf.next()) {
            var link = linkOutOf.value;
            this.breakContinueFromLinks.add(link);
        }
    };

    FlowDiagramLayout.prototype.processOneToManyNode = function(node, boundary, x, y, isPreprocess) {
        // need to keep track when we have nested parallel nodes to properly do nested center alignment
        this.nestedParallelCount += 1;
        if (this.nestedParallelCount > 1 && this.parallelInfo[node.key]) {
            this.parallelInfo[node.key].parentParallelKey = this.currentParallelNodeKey;
        }
        // PARALLEL BLOCK group dimensions should include their corresponding END node
        this.enlargeGroupDimension(node);
        var groupBoundaryBegin = boundary.copy();
        var linkIt = node.findLinksOutOf();
        var link;
        var returnedNextNodeLoop;
        // all parallel blocks will have the same y-axis
        var parallelY = y + boundary.height + (this.isDecisionNode(node) ? LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_DECISION : LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_PARALLEL);
        var parallelX = x;
        var boundaryWidth = boundary.width;
        var branchCount = 0;
        var firstBranchX = 0;
        var lastBranchX = 0;
        var parallelNodeKey = node.data.key;
        if (this.parallelMap[parallelNodeKey]) {
            parallelX += this.parallelMap[parallelNodeKey].parallelX;
        }
        // Temperary workaround until fix add branch so nodes are added to end rather than beginning
        var linkList = new go.List();
        while (linkIt.next()) {
            var linkToSort = linkIt.value;
            linkList.add(linkToSort);
        }
        var linkItSorted = linkList.sort(function(a, b) {
            // sort by arrayPosition rather than order, also handle StageType
            return (a.toNode.data.arrayPosition || a.toNode.data.componentIndexes_value) - (b.toNode.data.arrayPosition || b.toNode.data.componentIndexes_value);
        }).iterator;
        branchCount = linkItSorted.count;
        var endNode = null;
        // process parallel branches
        while (linkItSorted.next()) {
            link = linkItSorted.value;
            var results = this.renderParallelBranch(link, parallelX, parallelY, boundaryWidth, groupBoundaryBegin, node, returnedNextNodeLoop, firstBranchX, lastBranchX);
            parallelX = results.parallelX;
            boundaryWidth = results.boundaryWidth;
            groupBoundaryBegin = results.groupBoundaryBegin;
            firstBranchX = results.firstBranchX;
            lastBranchX = results.lastBranchX;
            returnedNextNodeLoop = results.returnedNextNodeLoop;

            // If end node found, save it for later. Otherwise, this will be lost on next iteration
            // Helps to address DEF0341349
            if (this.isEndParallel(returnedNextNodeLoop) || this.isEndDecision(returnedNextNodeLoop)) {
                endNode = returnedNextNodeLoop;
            }
        }
        var groupBoundaryFinal = groupBoundaryBegin;
        if (isPreprocess) {
            // if we are pre-processing for center align
            if (this.isCenterAlignEnabled(branchCount, node, this.parallelMap)) {
                var currentX = '';
                // DEF0344421: to adjust the x-axis when we have nested 1-to-many nodes
                if (this.nestedParallelCount > 1) {
                    currentX = firstBranchX;
                    this.nestedParallelCount -= 1;
                }
                if (firstBranchX < 0) {
                    currentX = '';
                }
                parallelX = this.calculateOneToManyCenterAlignOffset(firstBranchX, lastBranchX, currentX, this.x);
                var nodeDim = this.getNodeDimension(node);
                var groupBoundaryWidth = groupBoundaryFinal.width;
                var nodeDimensionWidth = nodeDim.width;
                var ancestorBlockNode = this.getAncestorBlockNode(node);
                if (ancestorBlockNode && ancestorBlockNode.actualBounds) {
                    // This will shift the ancestorBlockNode x coordinate based on the current parallel/decision's number of branches/children
                    var parentBranchCount = 0;
                    if (this.parallelInfo[node.key] && this.parallelInfo[node.key].parentParallelKey && this.parallelInfo[this.parallelInfo[node.key].parentParallelKey]) {
                        parentBranchCount = this.parallelInfo[this.parallelInfo[node.key].parentParallelKey].count;
                    }
                    // This will shift the x coordinate based on the current parallel/decision's number of branches/children
                    if (branchCount > 0 && nodeDimensionWidth > 0 && parentBranchCount > 1) {
                        // Before shifting, check for an associated stage.
                        var rootBlockNode;
                        var associatedStageNodeData = this.diagram.model.nodeDataArray.find(function(node) {
                            return node.associated_node_key === ancestorBlockNode.key;
                        });
                        if (associatedStageNodeData) {
                            // If it exists, it is considered the true root of the block
                            rootBlockNode = this._nodes.get(associatedStageNodeData.key);
                        } else {
                            // Otherwise, the ancestor is the true root of the block
                            rootBlockNode = ancestorBlockNode;
                        }
                        rootBlockNode.data.extraXOffset = (branchCount - 1) * nodeDimensionWidth / 2;
                    }
                }
                this.parallelMap[node.key] = {
                    parallelX: parallelX
                };

                this.nodeCenterAlignAdditionalXAxisMap[node.key] = ((groupBoundaryWidth / 2) - (nodeDimensionWidth / 2));
                this.setParentAdditionalXAxis(node, groupBoundaryWidth, nodeDimensionWidth);
            }
        } else {
            // after we process the horizontal children (branches) then process ENDPARALLEL node
            if (endNode) {
                parallelY = groupBoundaryFinal.y + groupBoundaryFinal.height + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_WITH_LABEL;
                endNode.moveTo(x, parallelY);
                var nextNextNode = this.walk(endNode, x, parallelY);
                var nextBoundary = this.getNodeDimension(endNode);
                groupBoundaryFinal = groupBoundaryFinal.unionRect(nextBoundary);
                returnedNextNodeLoop = nextNextNode;
            } else {
                // when there is no ENDPARALLEL (i.e. all branches have path broken) then
                // calculate y based on DFIP starting y (groupBoundaryFinal.y) plus group height
                // (groupBoundaryFinal.height)
                parallelY = groupBoundaryFinal.y + groupBoundaryFinal.height;
            }
            // if next node is undefined then a path broken will be added
            // we capture the coordinates in order to position the path broken with the ENDPARALLEL node
            if (!returnedNextNodeLoop && this.endNodePathBrokenMap[parallelNodeKey]) {
                this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[parallelNodeKey]].x = x;
                this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[parallelNodeKey]].y = parallelY + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_PB;
                groupBoundaryFinal.y = groupBoundaryFinal.y + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK_WITH_LABEL;
            }
        }
        this.setGroupDimension(node, groupBoundaryFinal);
        return returnedNextNodeLoop;
    };

    FlowDiagramLayout.prototype.processSimpleNode = function(node) {
        linkIt = node.findLinksOutOf();
        if (linkIt.next()) {
            return linkIt.value.toNode;
        } else {
            return undefined;
        }
    };

    FlowDiagramLayout.prototype.processConditionalNode = function(node, boundary, x, y) {
        var groupBoundaryConditional = boundary;
        var linkIt = node.findLinksOutOf();
        var linkTrue, linkFalse;
        while (linkIt.next()) {
            var link = linkIt.value;
            if (this.isConditionalTruePort(link.fromPortId)) {
                linkTrue = link;
            } else if (this.isConditionalFalsePort(link.fromPortId)) {
                linkFalse = link;
            }
        }
        var returnedNextNodeConditional;
        if (linkTrue) {
            var resultTrue = this.renderChildren(
                x,
                y,
                linkTrue,
                groupBoundaryConditional
            );
            groupBoundaryConditional = resultTrue.boundary;
            returnedNextNodeConditional = resultTrue.nextNode;
        }
        if (linkFalse) {
            var resultFalse = this.renderElseSibling(
                x,
                y,
                linkFalse,
                groupBoundaryConditional
            );
            groupBoundaryConditional = resultFalse.boundary;
            if (!returnedNextNodeConditional)
                returnedNextNodeConditional = resultFalse.nextNode;
        }
        this.setGroupDimension(node, groupBoundaryConditional);

        // If this is for a path broken source node, store the coordinates
        if (this.endNodePathBrokenMap[node.key]) {
            var pathBrokenX = x;
            this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[node.key]].x = pathBrokenX;
            var pathBrokenY = groupBoundaryConditional.y + groupBoundaryConditional.height + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
            this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[node.key]].y = pathBrokenY;
        }
        return returnedNextNodeConditional;
    };

    FlowDiagramLayout.prototype.processBlockNode = function(node, boundary, x, y) {
        var groupBoundaryLoop = boundary;
        var linkIt = node.findLinksOutOf();
        var linkLoop;
        if (linkIt.next()) {
            linkLoop = linkIt.value;
        }
        var returnedNextNodeLoop;
        if (linkLoop) {
            var result = this.renderChildren(
                x,
                y,
                linkLoop,
                groupBoundaryLoop
            );
            groupBoundaryLoop = result.boundary;
            returnedNextNodeLoop = result.nextNode;
        }
        if (this.isDoLoopNode(node)) {
            groupBoundaryLoop.width += LAYOUT_CONFIGURATION.EDGE_STICK_OUT_RIGHT * 2;
        } else if (this.isLoopNode(node)) {
            groupBoundaryLoop.width += LAYOUT_CONFIGURATION.EDGE_STICK_OUT_RIGHT;
        }
        this.setGroupDimension(node, groupBoundaryLoop);
        // If this is for a path broken source node, store the coordinates
        if (this.endNodePathBrokenMap[node.key]) {
            this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[node.key]].x = x;
            this.pathBrokenNodeDimensions[this.endNodePathBrokenMap[node.key]].y = groupBoundaryLoop.y + groupBoundaryLoop.height + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
        }
        return returnedNextNodeLoop;
    };

    FlowDiagramLayout.prototype.processContinueNode = function(node) {
        var linkIt = node.findLinksOutOf();
        var linkContinue;
        while (linkIt.next()) {
            var link = linkIt.value;
            linkContinue = link;
        }
        if (linkContinue) {
            if (this.invalidBound(linkContinue.fromNode) || this.invalidBound(linkContinue.toNode)) {
                return;
            }
            var fromNodeBoundary = linkContinue.fromNode.actualBounds;
            var fromPortBoundary = linkContinue.fromPort.actualBounds;
            var toNodeBoundary = linkContinue.toNode.actualBounds;
            var toPortBoundary = linkContinue.toPort.actualBounds;
            if (
                fromNodeBoundary &&
                fromPortBoundary &&
                toNodeBoundary &&
                toPortBoundary
            ) {
                var pts = linkContinue.points.copy();
                pts.clear();
                var fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                var toPosition = this.getRightPosition(toNodeBoundary, toPortBoundary);
                var yGap = LAYOUT_CONFIGURATION.EDGE_GAP_LARGE;
                pts.add(new go.Point(fromPosition.x, fromPosition.y));
                pts.add(new go.Point(fromPosition.x + yGap, fromPosition.y));
                pts.add(new go.Point(fromPosition.x + yGap, toPosition.y));
                pts.add(new go.Point(toPosition.x, toPosition.y));
                linkContinue.points = pts;
            }
        }
        return undefined;
    };

    FlowDiagramLayout.prototype.processContinueNode = function(node) {
        var linkIt = node.findLinksOutOf();
        var linkContinue;
        while (linkIt.next()) {
            var link = linkIt.value;
            linkContinue = link;
        }
        if (linkContinue) {
            if (this.invalidBound(linkContinue.fromNode) || this.invalidBound(linkContinue.toNode)) {
                return;
            }
            var fromNodeBoundary = linkContinue.fromNode.actualBounds;
            var fromPortBoundary = linkContinue.fromPort.actualBounds;
            var toNodeBoundary = linkContinue.toNode.actualBounds;
            var toPortBoundary = linkContinue.toPort.actualBounds;
            if (
                fromNodeBoundary &&
                fromPortBoundary &&
                toNodeBoundary &&
                toPortBoundary
            ) {
                var pts = linkContinue.points.copy();
                pts.clear();
                var fromPosition = this.getRightPosition(fromNodeBoundary, fromPortBoundary);
                var toPosition = this.getRightPosition(toNodeBoundary, toPortBoundary);
                var yGap = LAYOUT_CONFIGURATION.EDGE_GAP_LARGE;
                pts.add(new go.Point(fromPosition.x, fromPosition.y));
                pts.add(new go.Point(fromPosition.x + yGap, fromPosition.y));
                pts.add(new go.Point(fromPosition.x + yGap, toPosition.y));
                pts.add(new go.Point(toPosition.x, toPosition.y));
                linkContinue.points = pts;
            }
        }
        return undefined;
    };

    FlowDiagramLayout.prototype.processBreakContinueNode = function(linkIt) {
        while (linkIt.next()) {
            var link = linkIt.value;
            if (this.isBreakNode(link.fromNode))
                this.createBreakLink(link);
            else
                this.createContinueLink(link);
        }
        return undefined;
    };

    FlowDiagramLayout.prototype.processEndNode = function(node) {
        var sourceNodeKey = this.getSourceNodeKey(node);
        var goBackAdditionalGap = this.additionalGoBackEdgeSpacing(sourceNodeKey);
        var renderLinkBackHorizontal = false;

        // works for both ENDLOOP with 2 links of linkContinue and linkBack
        // and ENDIF with 1 link of linkContinue
        var linkIt = node.findLinksOutOf();
        var linkContinue, linkBack;
        while (linkIt.next()) {
            var link = linkIt.value;
            if (this.isLoopBackPort(link.toPortId)) {
                if (this.isUntilLoopOutputPort(link.fromPortId)) {
                    renderLinkBackHorizontal = true;
                }
                linkBack = link;
            } else {
                linkContinue = link;
            }
        }
        if (linkBack) {
            this.updateBackLink(linkBack, goBackAdditionalGap, renderLinkBackHorizontal);
        }
        // IF and LOOP group dimensions should include their corresponding END node
        this.enlargeGroupDimension(node, goBackAdditionalGap);
        if (linkContinue) {
            return linkContinue.toNode;
        } else {
            return undefined;
        }
    };

    // Post process certain links such as go back to and try catch since those rely on completed walks
    FlowDiagramLayout.prototype.postProcessLinks = function(y, x) {
        // Routing break continue links
        var linksBrCo = this.breakContinueFromLinks;
        var linkOutOfBrCo = linksBrCo.iterator;
        this.processBreakContinueNode(linkOutOfBrCo);

        // Routing go back to links
        var links = this.goBackToFromLinks;
        var linkOutOf = links.iterator;
        var linksOutOfResult = this.categorizeLinksInto(linkOutOf, x);
        this.routeLinks(linksOutOfResult, y, true);
    };

    FlowDiagramLayout.prototype.walk = function(node, x, y, isPreprocess) {
        if (this._dimensions.has(node.data.key)) {
            // the node has been visited
            return;
        }
        var linkIt = node.findLinksInto();
        var linksIntoResult = this.categorizeLinksInto(linkIt, x);
        if (this.shouldUpdateNodeY(node, linksIntoResult, this.stageNodesMap)) {
            y = this.updateNodeY(
                linksIntoResult.verticalLink,
                linksIntoResult.customLinks,
                node,
                y,
                this.isGoBackToTargetNode(node)
            );
        }

        if (!isPreprocess) {
            this.moveNodeTo(node, x, y);
        } else {
            this.moveNodeTo(node, 0, 0);
        }

        if (!this.isDecisionBlock(node)) {
            var isHorizontalY = this.isEndParallel(node) || this.isEndDecision(node);
            this.routeLinks(linksIntoResult, isHorizontalY);
        }
        // keep track of current logic block in the case we hit a path broken
        if (this.isGroupParentNode(node)) {
            this.currentLogicBlockKeys.push(node.key);
        }

        var boundary = node.actualBounds.copy();
        this.setNodeDimension(node, boundary);
        var type = this.getNodeShapeType(node);
        switch (type) {
            case NODE_TYPES.SIMPLE:
                return this.processSimpleNode(node);
            case NODE_TYPES.CONDITIONAL:
                return this.processConditionalNode(node, boundary, x, y);
            case NODE_TYPES.BLOCK:
                return this.processBlockNode(node, boundary, x, y);
            case NODE_TYPES.END:
                return this.processEndNode(node);
            case NODE_TYPES.CONTINUE:
                return this.processContinueNode(node);
            case NODE_TYPES.ONE_TO_MANY:
                return this.processOneToManyNode(node, boundary, x, y, isPreprocess);
            case NODE_TYPES.GO_BACK_TO:
                return undefined;
            case NODE_TYPES.ADD_A_NODE:
                return this.postProcessLinks(y, x);
        }
    };

    // returns nextNode after the walk iteration has been exhausted
    FlowDiagramLayout.prototype.processRootLevelNodes = function(nextNode, x, y) {
        while (nextNode) {
            var nextNextNode = this.walk(nextNode, x, y);
            y = this.adjustNextNodeYAxis(nextNode, nextNextNode, y);
            var linkIt = nextNode.findLinksOutOf();
            if (this.isPathBrokenLoopNode(nextNode, linkIt.count)) {
                y = y + LAYOUT_CONFIGURATION.HEIGHT_VERTICAL_LINK;
            }
            // check for path broken
            if (!nextNextNode) {
                var pathBrokenKey = this.endNodePathBrokenMap[nextNode.data.key];
                if (!pathBrokenKey) {
                    while (this.currentLogicBlockKeys.length && !pathBrokenKey) {
                        pathBrokenKey = this.endNodePathBrokenMap[this.currentLogicBlockKeys.pop()];
                    }
                }
                if (pathBrokenKey && this.pathBrokenNodeDimensions[pathBrokenKey] &&
                    !isNaN(this.pathBrokenNodeDimensions[pathBrokenKey].x) &&
                    !isNaN(this.pathBrokenNodeDimensions[pathBrokenKey].y)) {
                    nextNextNode = this._nodes.get(pathBrokenKey);
                    x = this.pathBrokenNodeDimensions[pathBrokenKey].x;
                    y = this.pathBrokenNodeDimensions[pathBrokenKey].y;
                    // clear logic block key
                    this.currentLogicBlockKeys = [];
                }
            }
            // check for last node (Add a node)
            if (!nextNextNode) {
                if (!this._dimensions.has(this.end.data.key)) {
                    nextNextNode = this.end;
                }
            }
            nextNode = nextNextNode;
        }
        return {
            nextNode: nextNode,
            x: x,
            y: y
        };
    };

    // if we have PARALLEL (1-to-many) nodes then pre-walk to calculate each branch dimensions to determine center alignment
    FlowDiagramLayout.prototype.preprocessParallelNodes = function(parallelNodes) {
        this.preprocessFlag = true;
        var parallelIt = parallelNodes.iterator;
        if (this.isCenterAlignEnabled()) {
            while (parallelIt.next()) {
                var node = parallelIt.value;
                this.currentParallelNodeKey = node.data.key;
                this.walk(node, 0, 0, this.preprocessFlag);
                this.nestedParallelCount = 0;
            }
            this._dimensions.clear();
        }
        this.currentParallelNodeKey = '';
        this.preprocessFlag = false;
    };

    //pre-process go-back targets - find siblings between target and source
    FlowDiagramLayout.prototype.preprocessGoBackTo = function() {
        var targetIt = this.goBackToTargetNodes.iterator;
        while (targetIt.next()) {
            var targetNodekey = targetIt.value || "";
            var sourceNodeKey = this.goBackToTargetMap[targetNodekey];
            var targetNode = this._nodes.get(targetNodekey);
            var sourceNode = this._nodes.get(sourceNodeKey);
            if (targetNode) {
                var targetNodeData = targetNode.data || {};
                // find source parent that matches target parent level
                var targetNodeParentKey = targetNodeData.parent || "";
                var sourceParentKey = this.findSourceNodeParentMatchingTargetScope(sourceNode, targetNodeParentKey);
                this.recursiveCaptureSiblings(targetNodekey, targetNodekey, sourceParentKey);
                if (sourceNodeKey && !this.goBackToNodeToTopParentMap[sourceNodeKey]) {
                    this.goBackToNodeToTopParentMap[sourceNodeKey] = sourceParentKey;
                    // capture counts of targets within a parent logic block
                    if (!this.goBackToEdgesToProcess[sourceParentKey]) {
                        this.goBackToEdgesToProcess[sourceParentKey] = 1;
                    } else {
                        this.goBackToEdgesToProcess[sourceParentKey] = this.goBackToEdgesToProcess[sourceParentKey] + 1;
                    }
                }
            }
        }
    };

    // initial traverse of nodes to find trigger, end node, path broken, hidden else, stage, and parallel nodes
    FlowDiagramLayout.prototype.preprocessNodes = function(nodes, parallelNodes) {
        var it = nodes.iterator;
        var currNodeKey;
        while (it.next()) {
            var node = it.value;
            currNodeKey = node.key;
            this._nodes.set(node.key, node);
            this._hiddenElseLinks.remove(node.key);
            if (this.isFlowTriggerOrSubflowInputsOutputs(node)) {
                this.trigger = node;
            } else if (this.isFlowEnd(node)) {
                this.end = node;
            } else if (this.isPathBroken(node)) {
                if (node.data && node.data.key) {
                    this.pathBrokenNodeDimensions[node.data.key] = {};
                    // Store the key of the source node that caused this path broken
                    var sourceKey = this.findPathBrokenSourceNodeKey(node);
                    this.endNodePathBrokenMap[sourceKey] = node.data.key;
                }
            } else if (this.isOneToManyFlowLogic(node) && !this.isEndDoLoop(node)) {
                parallelNodes.add(node);
                var linkIt = node.findLinksOutOf();
                var branchCnt = linkIt.count;
                this.parallelInfo[node.key] = {
                    count: branchCnt,
                    name: node.data.name,
                    parentParallelKey: ''
                };
            } else if (this.isStageNode(node)) {
                if (node.data && node.data.key && node.data.associated_node_key) {
                    this.stageNodesMap[node.data.associated_node_key] = node.data.key;
                    this.stageNodeAssociatedMap[node.data.key] = node.data.associated_node_key;
                }
            } else if (this.isParallelBlock(node) || this.isDecisionBlock(node)) {
                // DEF0323375: incremental updates causes issue with parallel branches alignment because nodes have preset actualBounds
                // DEF0367718: this may not be needed anymore (see moveNodeTo function)
                node.moveTo(0, 0);
            } else if (this.isGoBackToNode(node)) {
                node.moveTo(0, 0);
                if (node.data && node.data.data && node.data.data.go_back_to_step) {
                    var targetKey = node.data.data.go_back_to_step;
                    this.goBackToTargetMap[targetKey] = node.data.key;
                    this.goBackToTargetNodes.add(targetKey);
                }
                this.captureGoBackToEdges(node);
            } else if (this.isContinueNode(node) || this.isBreakNode(node)) {
                node.moveTo(0, 0);
                this.captureBreakContinueEdges(node);
            }
            // ex. IF, ELSEIF
            var nextSiblingId = this.getRelation(node, "nextSibling");
            if (nextSiblingId && !this._nodes.has(nextSiblingId)) {
                // nextSibling is a hidden ELSE node
                if (!this._hiddenElseLinks.has(nextSiblingId)) {
                    this._hiddenElseLinks.set(nextSiblingId, {});
                }
                this._hiddenElseLinks.get(nextSiblingId).key = nextSiblingId;
                this._hiddenElseLinks.get(nextSiblingId).previousSibling = node.data.key;
            }
            var previousSiblingId = this.getRelation(node, "previousSibling");
            if (previousSiblingId && !this._nodes.has(previousSiblingId)) {
                // previousSibling is a hidden ELSE node
                if (!this._hiddenElseLinks.has(previousSiblingId)) {
                    this._hiddenElseLinks.set(previousSiblingId, {});
                }
                var elseNode = this._hiddenElseLinks.get(previousSiblingId);
                elseNode.key = previousSiblingId;
                elseNode.nextSibling = node.data.key;
                if (this.isEndIf(node) || this.isPathBroken(node)) {
                    elseNode.parent = node.data.sourceIfNodeKey; // set the parent IF node for the hidden else
                }
            }
            var parentId = this.getRelation(node, "parent");
            // if parent is ELSE capture children
            if (parentId && this._hiddenElseLinks.has(parentId)) {
                if (!this._hiddenElseLinks.get(parentId).children) {
                    this._hiddenElseLinks.get(parentId).children = [];
                }
                this._hiddenElseLinks.get(parentId).children.push(node.data.key);
            }
        }
        this.lastNodeKey = currNodeKey;
    };

    FlowDiagramLayout.prototype.getNodesAsList = function(nodes) {
        var nodeList = new go.List();
        var nodesIt = nodes.iterator;
        while (nodesIt.next()) {
            var nodeToSort = nodesIt.value;
            nodeList.add(nodeToSort);
        }
        return nodeList;
    };

    FlowDiagramLayout.prototype.sortByStage = function(nodeList) {
        var sortedNodes = nodeList.sort(function(a, b) {
            if (!a.data || !a.data.instanceType) {
                return 0;
            }
            if (a.data.instanceType === INSTANCE_TYPES.STAGE_TYPE) {
                return -1;
            }
            return 0;
        });
        return sortedNodes;
    };

    FlowDiagramLayout.prototype.sortNodesByStageInstance = function(nodes) {
        var nodeList = this.getNodesAsList(nodes);
        return this.sortByStage(nodeList);
    };

    //  CUSTOM LAYOUT LOGIC
    FlowDiagramLayout.prototype.doLayout = function() {

        try {
            if (!this.diagram) {
                return;
            }
            this._resetMapData();
            var nodes = this.diagram.nodes;
            var parallelNodes = new go.List();

            this.trigger;
            this.end;
            this.lastNodeKey = '';
            this.parallelMap = {};
            this.parallelInfo = {};
            this.preprocessFlag = true;
            this.nestedParallelCount = 0;
            this.currentParallelNodeKey = '';
            this.nodeCenterAlignAdditionalXAxisMap = {};
            this.endNodePathBrokenMap = {};
            this.pathBrokenNodeDimensions = {};
            this.stageNodesMap = {};
            this.stageNodeAssociatedMap = {};
            this.ifWithElseIforElse = {};
            this.goBackToTargetMap = {};
            this.goBackToNodeToTopParentMap = {};
            this.goBackToFromLinks = new go.List();
            this.goBackToTargetNodes = new go.List();
            this.targetSiblingMap = {};
            this.goBackToEdgesToProcess = {};
            this.additionalGoBackToWidth = false;
            this.targetHasGoBackEdge = {};
            this.currentLogicBlockKeys = [];
            this.breakContinueFromLinks = new go.List();

            // DEF0396233: in preprocessing nodes goback needs to know about any stage nodes associated with the target node
            // incremental updates can add Stage node at the end of the list which is causing the issue
            var sortedNodes = this.sortNodesByStageInstance(nodes);

            // find trigger, end nodes, capture hidden else, path broken, stage relations, and parallel node details
            this.preprocessNodes(sortedNodes, parallelNodes);

            // couldn't find a trigger node or an end node
            if (!this.trigger || !this.end) {
                return;
            }

            this.diagram.startTransaction("Flow Diagram Layout");
            // start on the left, at Layout.arrangementOrigin
            this.arrangementOrigin = this.initialOrigin(this.arrangementOrigin);
            this.x = this.arrangementOrigin.x;
            this.y = this.arrangementOrigin.y;

            //pre-process go-back targets to capture siblings between target and source
            this.preprocessGoBackTo();

            // pre-process any 1-to-many nodes to calculate center alignment
            this.preprocessParallelNodes(parallelNodes);

            // iterate nodes and walk each one
            this.processRootLevelNodes(this.trigger, this.x, this.y);

            this.diagram.commitTransaction("Flow Diagram Layout");
            this._resetMapData();
        } catch (e) {
            console.error("Failed to Execute Layout Logic: ", e);
        }
    };

    return $(FlowDiagramLayout);
}
