function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    //Specify the shape and properties of the adornment that is required for this shape template on hover.
    var baseShape = {
        'shape': 'Rectangle',
        'shapeProps': {
            'stroke': resolveThemeVariable('--now-color--primary-1'),
            'strokeWidth': 1,
            'strokeDashArray': [5, 3],
            'width': 250,
            'height': 80,
            'fill': null
        },
    };
    var buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate;
    var dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates;
    var nodeHoverAdornment = buildDependentShapeTemplate(dependentShapeTemplates[0], baseShape);
    return function(e, obj) {
        var node = obj.part;
        nodeHoverAdornment.adornedObject = node;
        node.addAdornment('mouseEnter', nodeHoverAdornment);
    };
}
