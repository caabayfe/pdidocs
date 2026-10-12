var BuilderConfiguration = Class.create();

// table name
BuilderConfiguration.TABLE = 'sn_diagram_builder_configuration';

// table fields
BuilderConfiguration.PROPS = 'props';
BuilderConfiguration.NAME = 'name';
BuilderConfiguration.RIGHT_PANEL = 'right_panel';
BuilderConfiguration.LEFT_PANEL = 'left_panel';
BuilderConfiguration.LEFT_COMPONENT = 'left_component';
BuilderConfiguration.RIGHT_COMPONENT = 'right_component';
BuilderConfiguration.ALERTS_COMPONENT = 'alerts_component';
BuilderConfiguration.HEADER = 'header';
BuilderConfiguration.THEME = 'theme';
BuilderConfiguration.ADVANCED = 'advanced';
BuilderConfiguration.DIAGRAM_TEMPLATE = 'diagram_template';
BuilderConfiguration.ENABLE_LAYOUT_CUSTOMIZATION = 'enable_layout_customization';
BuilderConfiguration.LAYOUT = 'layout';
BuilderConfiguration.CONTENT_ALIGNMENT = 'content_alignment';
BuilderConfiguration.ENABLE_DRAGGING = 'enable_dragging';
BuilderConfiguration.ENABLE_ANIMATION = 'enable_animation';
BuilderConfiguration.ENABLE_SEARCH = 'enable_search';
BuilderConfiguration.DIAGRAM_OPTIONS = 'diagram_options';
BuilderConfiguration.PALETTE = 'palette_configuration';

// initialize script include by extending Crud base
BuilderConfiguration.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = BuilderConfiguration.TABLE;
    },

    type: 'DiagramBuilderCategory'
});


BuilderConfiguration.getConfigurationByConfigId = function(configId) {
    return new BuilderConfiguration().getById(configId);
};

BuilderConfiguration.getConfigurationByScopeId = function(scopeId) {
    return new BuilderConfiguration().getByQuery('sys_scope=' + scopeId);
};

BuilderConfiguration.getDefaultDiagramOptions = function() {
    return "function getDiagramOptions($, go, dispatch, uuidv4, resolveThemeVariable, getTranslatedMessage, diagramHandlers) {\n\treturn {\n\t\tallowDelete: false,\n\t\tinitialDocumentSpot: go.Spot.Top,\n\t\tinitialViewportSpot: go.Spot.Top,\n\t\tmaxSelectionCount: 1,\n\t\t'toolManager.gestureBehavior': go.ToolManager.GestureZoom,\n\t\t'toolManager.hoverDelay': 300,\n\t\t'relinkingTool.linkValidation': function(fromNode, fromPort, toNode) {\n\t\t\tif (fromNode.containingGroup || toNode.containingGroup) {\n\t\t\t\treturn (fromNode.containingGroup && toNode.containingGroup && toNode.containingGroup.data.key === fromNode.containingGroup.data.key);\n\t\t\t}\n\t\t\treturn true;\n\t\t},\n\t\t'draggingTool.dragsLink': false,\n\t\t'undoManager.isEnabled': true,\n\t\t'undoManager.maxHistoryLength': 0,\n\t\t'contextMenuTool.canStart': function() {\n\t\t\tif (this.diagram.lastInput.clickCount > 1) return false;\n\t\t\treturn go.ContextMenuTool.prototype.canStart.call(this);\n\t\t},\n\t\t'contextMenuTool.standardMouseClick': function() {\n\t\t\treturn false;\n\t\t},\n\t\t'contextMenuTool.standardMouseOver': function() {\n\t\t\t// No-op — prevents GoJS from triggering mouseEnter after closing the menu\n\t\t\t}\n\t\t'draggingTool.isEnabled': false,\n\t\t'animationManager.isEnabled': false,\n\t\tcontentAlignment: go.Spot.Center,\n\t\t'draggingTool.doActivate': function() {\n\t\t\tdispatch('GO_DIAGRAM#DRAGGING_TOOL_ACTIVATED',{\n\t\t\t\tdraggingTool: this\n\t\t\t\});\n\t\t},\n\t\t'draggingTool.doDeactivate': function() {\n\t\t\tdispatch('GO_DIAGRAM#DRAGGING_TOOL_DEACTIVATED',{\n\t\t\t\tdraggingTool: this\n\t\t\t\});\n\t\t},\n\t\t'draggingTool.standardMouseSelect': function() {\n\t\t\tgo.DraggingTool.prototype.standardMouseSelect.call(this);\n\t\t\tdispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_SELECTED');\n\t\t},\n\t\t'draggingTool.doMouseMove': function() {\n\t\t\tdispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_MOVED',{\n\t\t\t\tdraggingTool: this\n\t\t\t\});\n\t\t},\n\t\t'draggingTool.doMouseUp': function() {\n\t\t\tdispatch('GO_DIAGRAM#DRAGGING_TOOL_MOUSE_UP',{\n\t\t\t\tdraggingTool: this\n\t\t\t\});\n\t\t},\n\t\t'linkingTool.linkValidation': function(fromNode, fromPort, toNode, toPort) { \n\t\t\t// Prevent linking to or from outside the group\n\t\t\tif (fromNode.containingGroup !== toNode.containingGroup) {\n\t\t\t\treturn false; // Links can only connect within the same group\n\t\t\t}\n\t\t\treturn true;\n\t\t},\n\t\tViewportBoundsChanged: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#VIEWPORT_BOUNDS_CHANGED', {\n\t\t\t\tevent: event\n\t\t\t});\n\t\t},\n\t\tLinkDrawn: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#LINK_DRAWN', {\n\t\t\t\tevent: event\n\t\t\t});\n\t\t},\n\t\tChangedSelection: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#SELECTION_CHANGED', {\n\t\t\t\tselection: event.subject.first()\n\t\t\t});\n\t\t},\n\t\tModelChanged: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#MODEL_CHANGED', {\n\t\t\t\tevent: event\n\t\t\t});\n\t\t},\n\t\tExternalObjectsDropped: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#EXTERNAL_OBJECTS_DROPPED', {\n\t\t\t\tevent: event\n\t\t\t});\n\t\t},\n\t\tmouseDrop: function(event) {\n\t\t\tdispatch('GO_DIAGRAM#DROP_ON_CANVAS_REQUESTED', {\n\t\t\t\tevent: event\n\t\t\t});\n\t\t},\n\t\t\n\t};\n}";
};
