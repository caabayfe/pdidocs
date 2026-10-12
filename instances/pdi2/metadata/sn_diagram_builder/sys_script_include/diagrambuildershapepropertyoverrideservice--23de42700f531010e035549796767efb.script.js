var DiagramBuilderShapePropertyOverrideService = Class.create();
DiagramBuilderShapePropertyOverrideService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapePropertyOverrideService'
};

DiagramBuilderShapePropertyOverrideService.getPropertyOverrideByTemplateMapId = function(templateMapId) {
    var shapePropertyOverridesGr = DiagramBuilderShapePropertyOverride.getPropertyOverrideByTemplateMapId(templateMapId);
    var shapePropertyOverrides = [];
    while (shapePropertyOverridesGr.next()) {
        shapePropertyOverrides.push({
            isAdvanced: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.IS_ADVANCED) === "1",
            bindingFunction: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.BINDING_FUNCTION),
            isCustom: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VALUE_TYPE) === DiagramBuilderShapePropertyOverride.VALUE_TYPE_FUNCTION,
            customValue: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.CUSTOM_VALUE),
            constantValue: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.CONSTANT_VALUE),
            shapeProperty: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.SHAPE_PROPERTY),
            shapeTemplateMap: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.SHAPE_TEMPLATE_MAP),
            isDynamic: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VALUE_TYPE) === DiagramBuilderShapePropertyOverride.VALUE_TYPE_DYNAMIC,
            isInternal: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VALUE_TYPE) === DiagramBuilderShapePropertyOverride.VALUE_TYPE_INTERNAL,
            sourceProperty: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.SOURCE_PROPERTY),
            isThemeVariable: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VALUE_TYPE) === DiagramBuilderShapePropertyOverride.VALUE_TYPE_THEME_VARIABLE,
            isTranslationKey: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VALUE_TYPE) === DiagramBuilderShapePropertyOverride.VALUE_TYPE_TRANSLATION_KEY,
            translationVariable: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.TRANSLATION_VARIABLE),
            variableName: shapePropertyOverridesGr.getValue(DiagramBuilderShapePropertyOverride.VARIABLE_NAME),
            sysId: shapePropertyOverridesGr.getUniqueValue()
        });
    }
    return shapePropertyOverrides;
};
