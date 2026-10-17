var FlowDiagramDatabaseApi = Class.create();
FlowDiagramDatabaseApi.prototype = {
    initialize: function() {},

    type: 'FlowDiagramDatabaseApi'
};

FlowDiagramDatabaseApi.getTemplateJSON = function(configurationId) {
    var configuration = new GlideRecord(FlowDiagramConstants.TABLE_NAMES.DIAGRAM_BUILDER.CONFIGURATION);
    if (configuration.get(configurationId)) {
        var template = new GlideRecord(FlowDiagramConstants.TABLE_NAMES.DIAGRAM_BUILDER.DIAGRAM_TEMPLATE);
        if (template.get(configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.DIAGRAM_TEMPLATE))) {
            return template.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.DIAGRAM_TEMPLATE.TEMPLATE_JSON);
        }
    }
    return "";
};

FlowDiagramDatabaseApi.getConfigurationActions = function(configurationId) {
    var actionsGR = new GlideRecord(FlowDiagramConstants.TABLE_NAMES.DIAGRAM_BUILDER.CANVAS_ACTION);
    var encodedQuery = "builder_configuration=" + configurationId;
    actionsGR.addEncodedQuery(encodedQuery);
    actionsGR.query();

    var actions = [];
    while (actionsGR.next()) {
        actions.push({
            id: actionsGR.getUniqueValue(),
            name: actionsGR.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CANVAS_ACTION.NAME),
            order: actionsGR.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CANVAS_ACTION.ORDER),
            componentTagName: actionsGR.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CANVAS_ACTION.ACTION_TYPE) == "action_component" ?
                actionsGR.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CANVAS_ACTION.UI_COMPONENT) : ""
        });
    }
    return actions;
};

FlowDiagramDatabaseApi.getConfiguration = function(configurationId) {
    var configuration = new GlideRecord(FlowDiagramConstants.TABLE_NAMES.DIAGRAM_BUILDER.CONFIGURATION);
    if (configuration.get(configurationId)) {
        var configurationObj = {
            id: configuration.getUniqueValue(),
            name: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.NAME),
            theme: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.THEME),
            leftPanel: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.LEFT_PANEL) == 1,
            leftComponent: configuration.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.LEFT_COMPONENT_TAG) || "",
            rightPanel: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.RIGHT_PANEL) == 1,
            rightComponent: configuration.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.RIGHT_COMPONENT_TAG) || "",
            alertsComponent: configuration.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.ALERTS_COMPONENT_TAG) || "",
            advancedProperties: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.ADVANCED) == 1,
            props: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.PROPS),
            nodeDef: [],
            actions: FlowDiagramDatabaseApi.getConfigurationActions(configurationId),
            header: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.HEADER) == 1,
            appScope: configuration.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.SCOPE_SCOPE_NAME),
            diagramTemplate: configuration.getDisplayValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.DIAGRAM_TEMPLATE_TEMPLATE_JSON),
            enableSearch: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.ENABLE_SEARCH) == 1,
            diagramOptions: configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.DIAGRAM_OPTIONS),
        };

        var enableLayoutCustomization = configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.ENABLE_LAYOUT_CUSTOMIZATION) == 1;
        if (enableLayoutCustomization) {
            var configScript = configuration.getValue(FlowDiagramConstants.FIELD_NAMES.DIAGRAM_BUILDER.CONFIGURATION.LAYOUT);
            var layout = sn_flow_diagram.FlowDiagramLayoutGenerator.createLayoutScript(configScript, FlowDiagramConstants);
            configurationObj.layout = layout;
        }

        return configurationObj;
    }
    return {};
};
