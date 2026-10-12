var DiagramBuilderPaletteConfigurationService = Class.create();
DiagramBuilderPaletteConfigurationService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderPaletteConfigurationService'
};

/**
 * getPaletteById: 
 *   - Returns the palette table data with config object.
 * @param {String} paletteId - Palette sys id.
 * @returns {Object} paletteConfig - Configuration data of palette.
 */
DiagramBuilderPaletteConfigurationService.getPaletteById = function(paletteId) {
    var paletteConfigurationGr = DiagramBuilderPaletteConfiguration.getPaletteById(paletteId);
    var paletteConfig = {};

    paletteConfig.sysId = paletteConfigurationGr.getUniqueValue();
    paletteConfig.name = paletteConfigurationGr.getValue(DiagramBuilderPaletteConfiguration.NAME);
    paletteConfig.options = paletteConfigurationGr.getValue(DiagramBuilderPaletteConfiguration.OPTIONS);

    return paletteConfig;
};
