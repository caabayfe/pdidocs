var DiagramBuilderShapeTemplateService = Class.create();
DiagramBuilderShapeTemplateService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderShapeTemplateService'
};

DiagramBuilderShapeTemplateService._constructShapeTemplateObject = function(shapeTemplateGr) {
    return {
        sysId: shapeTemplateGr.getUniqueValue(),
        name: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.NAME),
        description: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.DESCRIPTION),
        shape: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.SHAPE),
        templateType: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.TEMPLATE_TYPE),
        isAdvanced: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.TEMPLATE_TYPE) === "advanced",
        tabbable: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.TABBABLE) === "1",
        ariaLabel: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.ARIA_LABEL),
        tabClickHandler: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.TAB_CLICK_HANDLER),
        hasTabHandler: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.HAS_TAB_HANDLER) === "1",
        script: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.SCRIPT),
        properties: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.PROPERTIES),
        recenterHandler: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.HAS_RECENTER_HANDLER) === "1" ?
            shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.RECENTER_HANDLER) : null,
    };
};

DiagramBuilderShapeTemplateService.getShapeTemplatesByIDs = function(shapeTemplateIDArray) {
    var shapeTemplateGr = DiagramBuilderShapeTemplate.getShapeTemplatesByIDs(shapeTemplateIDArray);
    var shapeTemplates = [];
    while (shapeTemplateGr.next()) {
        shapeTemplates.push({
            id: shapeTemplateGr.getUniqueValue(),
            type: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.TYPE),
            script: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.SCRIPT),
            properties: shapeTemplateGr.getValue(DiagramBuilderShapeTemplate.PROPERTIES)
        });
    }

    return shapeTemplates;
};

DiagramBuilderShapeTemplateService.getShapeTemplateById = function(shapeTemplateId) {
    var shapeTemplateGr = DiagramBuilderShapeTemplate.getShapeTemplateById(shapeTemplateId);
    var shapeTemplate = DiagramBuilderShapeTemplateService._constructShapeTemplateObject(shapeTemplateGr);

    return shapeTemplate;
};
