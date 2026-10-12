var DiagramBuilderShapeService = Class.create();

DiagramBuilderShapeService.prototype = {
    initialize: function() {},
    type: 'DiagramBuilderShapeService',
};

DiagramBuilderShapeService._constructShapeObject = function(shapesGr) {
    return {
        componentName: shapesGr.getValue(DiagramBuilderShape.COMPONENT_NAME),
        componentType: shapesGr.getValue(DiagramBuilderShape.COMPONENT_TYPE),
        description: shapesGr.getValue(DiagramBuilderShape.DESCRIPTION),
        active: shapesGr.getValue(DiagramBuilderShape.ACTIVE) === "1",
        script: shapesGr.getValue(DiagramBuilderShape.SCRIPT),
        isCustom: shapesGr.getValue(DiagramBuilderShape.IS_CUSTOM) === "1",
        sysId: shapesGr.getUniqueValue()
    };
};

DiagramBuilderShapeService.getCustomShapes = function() {
    var shapesGr = DiagramBuilderShape.getCustomShapes();
    var shapes = [];
    while (shapesGr.next()) {
        shapes.push(DiagramBuilderShapeService._constructShapeObject(shapesGr));
    }

    return shapes;
};

DiagramBuilderShapeService.getShapeById = function(shapeId) {
    var shapesGr = DiagramBuilderShape.getShapeById(shapeId);
    return DiagramBuilderShapeService._constructShapeObject(shapesGr);
};

DiagramBuilderShapeService.getRefinedShapes = function(isBaseShapeTemplate) {
	var shapesQuery = DiagramBuilderShape.ACTIVE + '=true^' + DiagramBuilderShape.COMPONENT_TYPE + 'ISEMPTY^' + DiagramBuilderShape.COMPONENT_NAME + '!=Link^NQ' + DiagramBuilderShape.COMPONENT_TYPE + '!=Node^' + DiagramBuilderShape.COMPONENT_TYPE + '!=Group';
	if(isBaseShapeTemplate)
		shapesQuery = DiagramBuilderShape.ACTIVE + '=true^' + DiagramBuilderShape.COMPONENT_TYPE + 'INNode,Group^OR' + DiagramBuilderShape.COMPONENT_NAME + '=Link';
	
    var shapesGr = DiagramBuilderShape.getShapesByQuery(shapesQuery);
    var shapes = [];
    while (shapesGr.next()) {
        shapes.push(shapesGr.getUniqueValue());
    }

    return shapes;
};
