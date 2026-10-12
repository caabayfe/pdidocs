function getDiagramOptions($, go, dispatch, uuidv4) {
	var MAX_TABLE_ENTRIES_SHOWN = 10;
    return {
        allowDelete: false,
        initialDocumentSpot: go.Spot.Top,
        initialViewportSpot: go.Spot.Top,
        maxSelectionCount: 1,
        // support mouse wheel scrolling of table when the mouse is in the table
        'toolManager.doMouseWheel': function() {
            var e = this.diagram.lastInput;
            var tab = this.diagram.findObjectAt(e.documentPoint);
            while (tab !== null && !tab._updateScrollBar) tab = tab.panel;
            if (tab !== null) {
                var scrolling_table = tab.part;
                var table = scrolling_table.findObject("TABLE");
                var scrollbarButton = scrolling_table.findObject("SCROLLBARBUTTON");
                if (table && scrollbarButton) {
                    var delta = e.delta;
                    if (delta > 0) {
                        table.topIndex = Math.max(0, table.topIndex - 1);
                    } else if (delta < 0) {
                        table.topIndex = Math.min(table.topIndex + 1, Math.max(0, table.rowCount - MAX_TABLE_ENTRIES_SHOWN)); // Prevent exceeding row count or going below 0
                    }
                    var scrollLocation = (table.topIndex / table.rowCount) * (table.rowCount / (table.rowCount - MAX_TABLE_ENTRIES_SHOWN));
                    scrollbarButton.alignment = new go.Spot(0.5, scrollLocation, 0, 0);
                }

                e.handled = true;
                return;
            }
            go.ToolManager.prototype.doMouseWheel.call(this);
        },
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
        'draggingTool.isEnabled': false, // To enable/disable dragging of nodes and links
        'animationManager.isEnabled': false, // To enable/disable animations
        contentAlignment: go.Spot.Center, // Position to which content to be aligned
        'draggingTool.doActivate': function() { // To write custom logic when dragging gets started
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED');
            go.DraggingTool.prototype.doActivate.call(this);
        },
        'draggingTool.doDeactivate': function() { // To write custom logic when dragging gets stopped
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED');
            go.DraggingTool.prototype.doDeactivate.call(this);
        },
        'draggingTool.standardMouseSelect': function() { // To write custom logic when mouse selection done while dragging
            go.DraggingTool.prototype.standardMouseSelect.call(this);
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_SELECTED');
        },
        'draggingTool.doMouseMove': function() { // To write custom logic when mouse move started while dragging
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_MOVED');
            go.DraggingTool.prototype.doMouseMove.call(this);
        },
        'draggingTool.doMouseUp': function() { // To write custom logic when mouse up done while dragging
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_UP');
            go.DraggingTool.prototype.doMouseUp.call(this);
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
        },
    };
}
