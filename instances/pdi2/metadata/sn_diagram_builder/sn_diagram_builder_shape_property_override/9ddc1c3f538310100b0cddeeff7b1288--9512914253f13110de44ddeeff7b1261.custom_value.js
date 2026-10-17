function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    /*
    // Sample code to build dependent shape templates
    var buildDependentShapeTemplate = shapeTemplateUtilities.buildDependentShapeTemplate; // Function to build dependent shape templates
    var dependentShapeTemplates = shapeTemplateUtilities.dependentShapeTemplates; // Array of dependent shape templates
    var props = {
        'stroke': 'blue',
        'fill': resolveThemeVariable('--now-color--primary-0') // Syntax to retrieve the value associated with the specified theme variable
    };
    return buildDependentShapeTemplate(dependentShapeTemplates[0], props);
	*/
    var forcedColorsDarkTheme = window.matchMedia('(forced-colors)').matches && window.matchMedia('(prefers-color-scheme: dark)');
    return forcedColorsDarkTheme ? 'ButtonFace' : resolveThemeVariable('--now-color_background--primary');
}
