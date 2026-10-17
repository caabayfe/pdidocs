function getValue(go, dispatch, $, shapeTemplateUtilities) { 
	// Sample code to build dependent shape templates
    var buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate; // Function to build dependent shape templates
    var dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates; // Array of dependent shape templates
    var props = {
        'background': 'black'
    };
    return buildDependentShapeTemplate(dependentShapeTemplates[0], props);
}
