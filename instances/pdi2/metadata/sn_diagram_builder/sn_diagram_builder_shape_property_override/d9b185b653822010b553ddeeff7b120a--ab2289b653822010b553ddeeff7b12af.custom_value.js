function getValue(go, dispatch, $, shapeTemplateUtilities) {
    var buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate; // Function to build dependent shape templates
    var dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates; // Array of dependent shape templates
	return buildDependentShapeTemplate(dependentShapeTemplates[0]);
}
