var DiagramBuilderShapePropertyService = Class.create();
DiagramBuilderShapePropertyService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapePropertyService'
};

DiagramBuilderShapePropertyService._constructShapePropertyObject = function(shapePropertiesGr) {
    return {
        bindingFunction: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.BINDING_FUNCTION),
        isAdvanced: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.IS_ADVANCED) === "1",
        customValue: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.CUSTOM_VALUE),
        isCustom: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VALUE_TYPE) === DiagramBuilderShapeProperty.VALUE_TYPE_FUNCTION,
        isDynamic: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VALUE_TYPE) === DiagramBuilderShapeProperty.VALUE_TYPE_DYNAMIC,
        isThemeVariable: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VALUE_TYPE) === DiagramBuilderShapeProperty.VALUE_TYPE_THEME_VARIABLE,
        isTranslationKey: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VALUE_TYPE) === DiagramBuilderShapeProperty.VALUE_TYPE_TRANSLATION_KEY,
        isInternal: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VALUE_TYPE) === DiagramBuilderShapeProperty.VALUE_TYPE_INTERNAL,
        constantValue: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.CONSTANT_VALUE),
        translationVariable: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.TRANSLATION_VARIABLE),
        shapeTemplate: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.SHAPE_TEMPLATE),
        sourceProperty: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.SOURCE_PROPERTY),
        targetProperty: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.TARGET_PROPERTY),
        variableName: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.VARIABLE_NAME),
        sysId: shapePropertiesGr.getUniqueValue(),
        builderConfiguration: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.BUILDER_CONFIGURATION),
        componentType: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.COMPONENT_TYPE),
        isConfigProperty: shapePropertiesGr.getValue(DiagramBuilderShapeProperty.CONFIG_PROPERTY),
    };
};

DiagramBuilderShapePropertyService.getPropertiesByShapeTemplateId = function(shapeTemplateId) {
    var shapePropertiesGr = DiagramBuilderShapeProperty.getPropertiesByShapeTemplateId(shapeTemplateId);
    var shapeProperties = [];
    while (shapePropertiesGr.next()) {
        shapeProperties.push(DiagramBuilderShapePropertyService._constructShapePropertyObject(shapePropertiesGr));
    }
    return shapeProperties;
};

DiagramBuilderShapePropertyService.getPropertyById = function(shapePropertyId) {
    var shapePropertyGr = DiagramBuilderShapeProperty.getPropertyById(shapePropertyId);
    return DiagramBuilderShapePropertyService._constructShapePropertyObject(shapePropertyGr);
};

DiagramBuilderShapePropertyService.getPropertiesByConfigId = function(configId, componentType) {
    var configPropertiesGr = DiagramBuilderShapeProperty.getPropertiesByConfigId(configId, componentType);
    var configProperties = [];
    while (configPropertiesGr.next()) {
        configProperties.push(DiagramBuilderShapePropertyService._constructShapePropertyObject(configPropertiesGr));
    }
    return configProperties;
};
