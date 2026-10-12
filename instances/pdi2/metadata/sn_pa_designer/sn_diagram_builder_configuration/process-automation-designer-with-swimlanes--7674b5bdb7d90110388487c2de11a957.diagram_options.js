function getDiagramOptions($, go, dispatch, uuidv4) {
    var colorPrimary = "#01778E";
    var colorPrimaryWithOpacity = "rgba(1, 119, 142, 0.2)";
    var temporaryLinkCurviness = 30;

    var temporaryLink = $(
        go.Link, {
            layerName: 'Tool',
            curve: go.Link.Bezier,
            curviness: temporaryLinkCurviness,
        },
        $(go.Shape, {
            isPanelMain: true,
            stroke: colorPrimaryWithOpacity,
            strokeWidth: 16,
        }),
        $(go.Shape, {
            isPanelMain: true,
            stroke: colorPrimary,
            strokeWidth: 2
        }),
        $(
            go.Shape, // the arrowhead
            {
                toArrow: 'Standard',
                fill: '#01778E',
                stroke: null
            }
        )
    );

    function formInvisiblePort(from) {
        return $(go.Shape, 'Circle', {
            width: 0,
            height: 0,
            fill: null,
            stroke: null,
            segmentIndex: from ? 0 : -1,
        });
    }

    return {
        allowDelete: false,
        initialDocumentSpot: go.Spot.Top,
        initialViewportSpot: go.Spot.Top,
        maxSelectionCount: 1,
        'toolManager.gestureBehavior': go.ToolManager.GestureZoom,
        'toolManager.hoverDelay': 300,
        'undoManager.isEnabled': true,
        'undoManager.maxHistoryLength': 0,
        'contextMenuTool.canStart': function() {
            if (this.diagram.lastInput.clickCount > 1) return false;
            return go.ContextMenuTool.prototype.canStart.call(this);
        },
        'contextMenuTool.standardMouseClick': function() {
            return false;
        },

        'relinkingTool.copyLinkProperties': function() {},
        'relinkingTool.fromHandleArchetype': formInvisiblePort(true),
        'relinkingTool.toHandleArchetype': formInvisiblePort(false),
        'relinkingTool.temporaryLink': temporaryLink,
        'relinkingTool.temporaryFromPort': formInvisiblePort(true),
        'relinkingTool.temporaryToPort': formInvisiblePort(false),
        'relinkingTool.setNoTargetPortProperties': function(
            tempnode,
            tempport,
            toend
        ) {
            go.RelinkingTool.prototype.setNoTargetPortProperties.call(
                this,
                tempnode,
                tempport,
                toend
            );
            this.originalLink.opacity = 0;
            this.originalLink.removeAdornment('Selection');
        },
        'relinkingTool.doDeactivate': function() {
            this.originalLink.opacity = 1;
            this.originalLink.clearAdornments();
            this.originalLink.updateAdornments();
            go.RelinkingTool.prototype.doDeactivate.call(this);
        },
        'linkingTool.temporaryLink': temporaryLink,
        'linkingTool.temporaryFromPort': formInvisiblePort(true),
        'linkingTool.temporaryToPort': formInvisiblePort(false),
        'draggingTool.isEnabled': false,
        'animationManager.isEnabled': true,
        contentAlignment: go.Spot.Top,
        'draggingTool.doActivate': function(event) {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED');
            go.DraggingTool.prototype.doActivate.call(this);
        },
        'draggingTool.doDeactivate': function(event) {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED');
            go.DraggingTool.prototype.doDeactivate.call(this);
        },
        'draggingTool.standardMouseSelect': function(event) {
            go.DraggingTool.prototype.standardMouseSelect.call(this);
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_SELECTED');
        },
        'draggingTool.doMouseMove': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_MOVED');
            go.DraggingTool.prototype.doMouseMove.call(this);
        },
        'draggingTool.doMouseUp': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_UP');
            go.DraggingTool.prototype.doMouseUp.call(this);
        },
        ViewportBoundsChanged: function(event) {
            dispatch('GO_DIAGRAM#VIEWPORT_BOUNDS_CHANGED', {
                event: event
            });
        },
        LinkDrawn: function(event) {
            dispatch('GO_DIAGRAM#LINK_DRAWN', {
                event: event
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
        }
    };
}
