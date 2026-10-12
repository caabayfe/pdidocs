function getDiagramOptions($, go, dispatch, uuidv4, resolveThemeVariable, getTranslatedMessage, diagramHandlers) {
    return {
        allowDelete: false,
        maxSelectionCount: 1,
        'contentAlignment': go.Spot.Default,
        'initialPosition': new go.Point(0, 0),
        'toolManager.gestureBehavior': go.ToolManager.GestureZoom,
        'toolManager.hoverDelay': 300,
        'relinkingTool.linkValidation': function(fromNode, fromPort, toNode) {
            if (fromNode.containingGroup || toNode.containingGroup) {
                return (fromNode.containingGroup && toNode.containingGroup && toNode.containingGroup.data.key === fromNode.containingGroup.data.key);
            }
            return true;
        },
        'draggingTool.dragsLink': true,
        'undoManager.isEnabled': true,
        'undoManager.maxHistoryLength': 0,
        'contextMenuTool.canStart': function() {
            if (this.diagram.lastInput.clickCount > 1) return false;
            return go.ContextMenuTool.prototype.canStart.call(this);
        },
        'contextMenuTool.standardMouseClick': function() {
            return false;
        },
        'contextMenuTool.standardMouseOver': function() {
            // No-op — prevents GoJS from triggering mouseEnter after closing the menu
        },
        'animationManager.isEnabled': false,
        allowDrop: true,
        'draggingTool.isEnabled': true,
        'draggingTool.doActivate': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED', {
                draggingTool: this
            });
        },
        'draggingTool.doDeactivate': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED', {
                draggingTool: this
            });
        },
        'draggingTool.standardMouseSelect': function() {
            go.DraggingTool.prototype.standardMouseSelect.call(this);
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_SELECTED');
        },
        'draggingTool.doMouseMove': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_MOVED', {
                draggingTool: this
            });
        },
        'draggingTool.doMouseUp': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_UP', {
                draggingTool: this
            });

        },
        ViewportBoundsChanged: function(event) {
            dispatch('GO_DIAGRAM#VIEWPORT_BOUNDS_CHANGED', {
                event: event
            });
        },
        LinkDrawn: function(event) {
            dispatch('GO_DIAGRAM#LINK_DRAWN', {
                event: event,
                edgeId: "539bb9bb532310100b0cddeeff7b1207"
            });
        },
        ChangedSelection: function(event) {
            dispatch('GO_DIAGRAM#SELECTION_CHANGED', {
                selection: event.subject.first()
            });
        },
        ModelChanged: function(event) {
            dispatch('GO_DIAGRAM#MODEL_CHANGED', {
                event: event
            });
        },
        ExternalObjectsDropped: function(event) {
            dispatch('GO_DIAGRAM#EXTERNAL_OBJECTS_DROPPED', {
                event: event
            });
        },
        mouseDrop: function(event) {
            dispatch('GO_DIAGRAM#DROP_ON_CANVAS_REQUESTED', {
                event: event
            });
        },
    };
}
