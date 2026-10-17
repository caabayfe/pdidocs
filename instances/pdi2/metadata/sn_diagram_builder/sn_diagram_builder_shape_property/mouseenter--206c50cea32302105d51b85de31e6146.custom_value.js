function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    //Specify the shape and properties of the adornment that is required for this shape template on hover.
    return function(e, obj) {
        const node = obj.part;
        const {
            height,
            width
        } = node.actualBounds;
		
        const isPaletteNode = e?.diagram?.model.modelData._isPaletteNode;

        const baseShape = {
            'shape': 'Rectangle',
            'shapeProps': {
                'stroke': resolveThemeVariable('--now-color--primary-1'),
                'strokeWidth': 1,
                'width': width,
                'height': isPaletteNode ? height : height - 10,
                'fill': null
            },
        };

        const buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate;
        const dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates;
        const nodeHoverAdornment = buildDependentShapeTemplate(dependentShapeTemplates[0], baseShape);
        nodeHoverAdornment.adornedObject = node;
        node.addAdornment('mouseEnter', nodeHoverAdornment);
    };
}
