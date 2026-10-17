function getDiagramOptions($, go, dispatch, uuidv4) {
    return {
        padding: new go.Margin(5, 5, 163, 5),
        contentAlignment: go.Spot.Center,
        'draggingTool.isEnabled': false,
        'animationManager.isEnabled': false,
        allowDelete: false,
        initialDocumentSpot: go.Spot.Top,
        initialViewportSpot: go.Spot.Top,
        maxSelectionCount: 1,
        'toolManager.gestureBehavior': go.ToolManager.GestureZoom,
        'toolManager.hoverDelay': 300,
        'relinkingTool.linkValidation': function(fromNode, fromPort, toNode) {
            if (fromNode.containingGroup || toNode.containingGroup) {
                return (fromNode.containingGroup && toNode.containingGroup && toNode.containingGroup.data.key === fromNode.containingGroup.data.key);
            }
            return true;
        },
        'draggingTool.dragsLink': false,
        'undoManager.isEnabled': true,
        'undoManager.maxHistoryLength': 0,
        'contextMenuTool.canStart': function() {
            if (this.diagram.lastInput.clickCount > 1) return false;
            return go.ContextMenuTool.prototype.canStart.call(this);
        },
        'contextMenuTool.standardMouseClick': function() {
            return false;
        },
        'draggingTool.doActivate': function() { // To write custom logic when dragging gets started
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED', {
                draggingTool: this
            });
        },
        'draggingTool.doDeactivate': function() { // To write custom logic when dragging gets stopped
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED', {
                draggingTool: this
            });
        },
        'draggingTool.standardMouseSelect': function() { // To write custom logic when mouse selection done while dragging
            go.DraggingTool.prototype.standardMouseSelect.call(this);
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_SELECTED');
        },
        'draggingTool.doMouseMove': function() { // To write custom logic when mouse move started while dragging
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_MOVED', {
                draggingTool: this
            });
        },
        'draggingTool.doMouseUp': function() { // To write custom logic when mouse up done while dragging
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_UP', {
                draggingTool: this
            });
        },
        ViewportBoundsChanged: function(event) { // To write custom logic when viewportBoundsChanged
            dispatch('GO_DIAGRAM#VIEWPORT_BOUNDS_CHANGED', {
                event: event
            });
        },
        LinkDrawn: function(event) { // To write custom logic when link drawn
            dispatch('GO_DIAGRAM#LINK_DRAWN', {
                event: event
            });
        },
        ChangedSelection: function(event) { // To write custom log while selection gets changed
            dispatch('GO_DIAGRAM#SELECTION_CHANGED', {
                selection: event.subject.first()
            });
        },
        ModelChanged: function(event) { // To write custom logic when diagram model changed
            dispatch('GO_DIAGRAM#MODEL_CHANGED', {
                event: event
            });
        }
    };
}
