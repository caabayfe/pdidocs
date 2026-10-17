function getValue(go, dispatch, $, shapeTemplateUtilities) {
    var buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate;
    var dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates;
    return buildDependentShapeTemplate(dependentShapeTemplates[0]);
}
