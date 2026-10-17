var BuilderConfigurationService = Class.create();
BuilderConfigurationService.prototype = {
    initialize: function() {},

    type: 'BuilderConfigurationService'
};

BuilderConfigurationService.getConfigurationByConfigId = function(configId) {
    var builderConfigGr = BuilderConfiguration.getConfigurationByConfigId(configId);
    var builderConfig = {};

    builderConfig.name = builderConfigGr.getValue(BuilderConfiguration.NAME);
    builderConfig.props = builderConfigGr.getValue(BuilderConfiguration.ADVANCED) === "1" ?
        builderConfigGr.getValue(BuilderConfiguration.PROPS) : null;
    builderConfig.advancedProperties = builderConfigGr.getValue(BuilderConfiguration.ADVANCED);
    builderConfig.theme = builderConfigGr.getValue(BuilderConfiguration.THEME);
    builderConfig.id = builderConfigGr.getUniqueValue();
    builderConfig.leftPanel = builderConfigGr[BuilderConfiguration.LEFT_PANEL];
    builderConfig.leftComponent = builderConfigGr[BuilderConfiguration.LEFT_COMPONENT];
    builderConfig.rightPanel = builderConfigGr[BuilderConfiguration.RIGHT_PANEL];
    builderConfig.rightComponent = builderConfigGr[BuilderConfiguration.RIGHT_COMPONENT]["tag"];
    builderConfig.alertsComponent = builderConfigGr[BuilderConfiguration.ALERTS_COMPONENT]["tag"];
    builderConfig.header = builderConfigGr[BuilderConfiguration.HEADER];
    builderConfig.templateId = builderConfigGr.getValue(BuilderConfiguration.DIAGRAM_TEMPLATE);
    builderConfig.enableSearch = builderConfigGr.getValue(BuilderConfiguration.ENABLE_SEARCH) == 1;

    //Fetching Palette configuration
    var paletteId = builderConfigGr.getValue(BuilderConfiguration.PALETTE);
    if (!gs.nil(paletteId))
        builderConfig.paletteConfiguration = DiagramBuilderPaletteConfigurationService.getPaletteById(paletteId);

    var enableLayoutCustomization = builderConfigGr.getValue(BuilderConfiguration.ENABLE_LAYOUT_CUSTOMIZATION) == 1;
    if (enableLayoutCustomization) {
        builderConfig.layout = builderConfigGr.getValue(BuilderConfiguration.LAYOUT);
    }
    builderConfig.diagramOptions = builderConfigGr.getValue(BuilderConfiguration.DIAGRAM_OPTIONS);

    return builderConfig;
};

BuilderConfigurationService.getConfigurationIdByScopeId = function(scopeId) {
    var builderConfigGr = BuilderConfiguration.getConfigurationByScopeId(scopeId);
    if (builderConfigGr.next())
        return builderConfigGr.getUniqueValue();
    return null;
};
