var DiagramBuilderShapePropertyOverrideToTemplateService = Class.create();
DiagramBuilderShapePropertyOverrideToTemplateService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapePropertyOverrideToTemplateService'
};

DiagramBuilderShapePropertyOverrideToTemplateService.getDependentTemplatesForPropertyOverride = function(shapePropertyOverrideId) {
    var dependentShapeTemplates = [];
    var propOverrideToTemplateGr = DiagramBuilderShapePropertyOverrideToTemplate.getDependentShapeTemplatesByPropertyOverrideId(shapePropertyOverrideId);
    while (propOverrideToTemplateGr.next())
        dependentShapeTemplates.push(DiagramBuilderShapeTemplateApi.getShapeTemplateJson(propOverrideToTemplateGr.getValue(DiagramBuilderShapePropertyOverrideToTemplate.SHAPE_TEMPLATE)));

    return dependentShapeTemplates;
};
