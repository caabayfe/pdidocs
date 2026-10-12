function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var baseShape = shapeTemplateUtilities.jsonProps;
    return $(go.Adornment, 'Spot',
        $(go.Placeholder, {}),
        $(go.Shape, baseShape.shape, baseShape.shapeProps),
    );
}
