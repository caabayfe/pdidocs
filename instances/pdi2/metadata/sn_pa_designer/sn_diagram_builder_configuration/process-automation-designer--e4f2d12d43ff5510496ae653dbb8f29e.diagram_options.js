function getDiagramOptions($, go, dispatch, uuidv4, resolveThemeVariable) {
    // consistent with process-designer-configuration.constants.js's ENABLE_FEATURES.STAGES
    var PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES = 'stages';
    // configuration doesn't have access to shared defineShapeTemplateFeatures
    var PROCESS_TYPE_CONFIGURATION_PAD_MODE = '_padMode';

    var colorPrimary0 = resolveThemeVariable("--now-color--primary-0");
    var colorFocus2 = resolveThemeVariable("--now-color--focus-2");
    var temporaryLinkCurviness = 30;

    var temporaryLink = $(
        go.Link, {
            layerName: 'Tool',
            curve: go.Link.Bezier,
            curviness: temporaryLinkCurviness,
            fromShortLength: -4,
            toShortLength: -4,
        },
        $(go.Shape, {
            isPanelMain: true,
            stroke: colorFocus2,
            strokeWidth: 16,
        }),
        $(go.Shape, {
            isPanelMain: true,
            stroke: colorPrimary0,
            strokeWidth: 2
        }),
        $(
            go.Shape, // the arrowhead
            {
                toArrow: 'Triangle',
                fill: colorPrimary0,
                stroke: null,
                segmentOffset: new go.Point(4, 0),
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
        contentAlignment: go.Spot.Left,
        'draggingTool.doActivate': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED');
            go.DraggingTool.prototype.doActivate.call(this);
        },
        'draggingTool.doDeactivate': function() {
            dispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED');
            go.DraggingTool.prototype.doDeactivate.call(this);
        },
        'draggingTool.standardMouseSelect': function() {
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
            if (!event.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_ENABLE_FEATURES_STAGES] && event.subject.first() && event.subject.first().data.isGroup)
                return;
            if (event.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_PAD_MODE] && event.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_PAD_MODE] === 'preview')
                return;

            dispatch('GO_DIAGRAM#SELECTION_CHANGED', {
                selection: event.subject.first()
            });
        },
        ModelChanged: function(event) {
            dispatch('GO_DIAGRAM#MODEL_CHANGED', {
                event: event
            });
        },
        BackgroundSingleClicked: function(event) {
            if (event.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_PAD_MODE] && event.diagram.model.modelData[PROCESS_TYPE_CONFIGURATION_PAD_MODE] === 'preview')
                return;

            dispatch('PAD#DIAGRAM_CLICK_BACKGROUND');
        },
        BackgroundDoubleClicked: function(event) {
            dispatch('PAD#DIAGRAM_CLICK_BACKGROUND');
        }
    };
}
