var DiagramBuilderClientUtils = Class.create();
DiagramBuilderClientUtils.prototype = {
    initialize: function() {},
    getRefinedShapes: function() {
        return DiagramBuilderShapeService.getRefinedShapes(current.getValue(DiagramBuilderShapeTemplate.TEMPLATE_TYPE) === 'base');
    },
    excludeParentShapeTemplates: function() {
        return DiagramBuilderShapeTemplateMapService.excludeParentShapeTemplates(current.getValue(DiagramBuilderShapeTemplateMap.PARENT));
    },
    excludeParentShapeTemplatesForProperty: function() {
        var refQual = 'sys_idNOT IN' + DiagramBuilderShapeTemplateMapService.excludeParentShapeTemplates(current.getElement(DiagramBuilderShapePropertyToTemplate.SHAPE_PROPERTY)[DiagramBuilderShapePropertyToTemplate.SHAPE_TEMPLATE]);
        return refQual;
    },
    excludeParentShapeTemplatesForPropertyOverride: function() {
        var refQual = 'sys_idNOT IN' + DiagramBuilderShapeTemplateMapService.excludeParentShapeTemplates(current.getElement(DiagramBuilderShapePropertyOverrideToTemplate.SHAPE_PROPERTY_OVERRIDE)[DiagramBuilderShapePropertyOverride.SHAPE_TEMPLATE_MAP][DiagramBuilderShapeTemplateMap.PARENT]);
        return refQual;
    },

    type: 'DiagramBuilderClientUtils'
};
