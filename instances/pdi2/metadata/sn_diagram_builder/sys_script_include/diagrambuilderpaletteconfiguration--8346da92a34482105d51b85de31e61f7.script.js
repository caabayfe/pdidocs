var DiagramBuilderPaletteConfiguration = Class.create();

//Table Name
DiagramBuilderPaletteConfiguration.TABLE = 'sn_diagram_builder_palette_configuration';

//Table fields
DiagramBuilderPaletteConfiguration.NAME = 'name';
DiagramBuilderPaletteConfiguration.OPTIONS = 'options';

// initialize script include by extending Crud base
DiagramBuilderPaletteConfiguration.prototype = Object.extendsObject(DiagramBuilderBaseCRUD, {
    initialize: function() {
        this.table = DiagramBuilderPaletteConfiguration.TABLE;
    },

    type: 'DiagramBuilderPaletteConfiguration'

});

DiagramBuilderPaletteConfiguration.getPaletteById = function(paletteId) {
    return new DiagramBuilderPaletteConfiguration().getById(paletteId);
};

/*
 * getDefaultValue:
 *    - Defaults the value for the columns in the dictionary level (sn_diagram_builder_palette_configuration) 
 * @params {String} fieldName - Field name/column name for which default value needs to be set.
 * @returns {String} defaultValue - Returns default value that needs to be set.
 */
DiagramBuilderPaletteConfiguration.getDefaultValue = function(fieldName) {
    var defaultValue;
    switch (fieldName) {
		case DiagramBuilderPaletteConfiguration.OPTIONS:
			defaultValue = "function getPaletteOptions($, go, dispatch, uuidv4, resolveThemeVariable, getTranslatedMessage, paletteHandlers) {\n\treturn {\n\t\tmaxSelectionCount: 1,\n\t\tallowDelete: false,\n\t\t'draggingTool.doActivate': function() {\n\t\t\tgo.DraggingTool.prototype.doActivate.call(this);\n\t\t\tthis.diagram.findLayer('Tool').opacity = 0.5;\n\t\t},\n\t\t'draggingTool.doDeactivate': function() {\n\t\t\tgo.DraggingTool.prototype.doDeactivate.call(this);\n\t\t\tthis.diagram.findLayer('Tool').opacity = 1;\n\t\t},\n\t\t'contextMenuTool.standardMouseClick': function() {\n\t\t\treturn false;\n\t\t}\n\t};\n}";
			break;
    }
    return defaultValue;
};
