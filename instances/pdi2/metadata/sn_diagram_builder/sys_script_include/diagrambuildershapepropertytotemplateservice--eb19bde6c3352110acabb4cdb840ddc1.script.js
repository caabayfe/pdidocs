var DiagramBuilderShapePropertyToTemplateService = Class.create();
DiagramBuilderShapePropertyToTemplateService.prototype = {
    initialize: function() {},

    type: 'DiagramBuilderShapePropertyToTemplateService'
};

DiagramBuilderShapePropertyToTemplateService.getDependentTemplatesForProperty = function(shapePropertyId) {
    var dependentShapeTemplates = [];
    var propToTemplateGr = DiagramBuilderShapePropertyToTemplate.getDependentShapeTemplatesByPropertyId(shapePropertyId);
    while (propToTemplateGr.next())
        dependentShapeTemplates.push(DiagramBuilderShapeTemplateApi.getShapeTemplateJson(propToTemplateGr.getValue(DiagramBuilderShapePropertyToTemplate.SHAPE_TEMPLATE)));

    return dependentShapeTemplates;
};
