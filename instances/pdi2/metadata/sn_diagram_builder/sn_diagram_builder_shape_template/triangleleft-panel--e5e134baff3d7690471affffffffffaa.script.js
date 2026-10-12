function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable, getTranslatedMessage) {
    /*
    // Sample code to reuse the child shape templates
    var buildChildShapeTemplate = shapeTemplateUtilities.buildChildShapeTemplate; // Function to build child shape templates
    var children = shapeTemplateUtilities.children; // Array of children shape templates

    // To pass the props from parent to child shape template
    var props = {
        'toolTip': getTranslatedMessage('toolTipKey'),	//Syntax to retrieve the translated value using key		
		'stroke': 'blue',
		'fill': resolveThemeVariable('--now-color--primary-0'), // Syntax to retrieve the value associated with the specified theme variable
		'background': resolveThemeVariable('--now-color--primary-0', false) // Syntax to retrieve the rgb value associated with the specified color theme variable. By default, returns hex value
    };

    return $(go.Node, 'Auto',
        buildChildShapeTemplate(children[0], props), // Build the first child shape template, if any.
        buildChildShapeTemplate(children[1], props) // Build the second shape template, if any.
    );

    // Usage of the json props in child shape template that are passed from the parent
    var jsonProps = shapeTemplateUtilities.jsonProps; // JSON props passed from the parent shape template

    return $(go.Node, 'Auto',
        buildChildShapeTemplate(children[0], jsonProps), // Build the first child shape template, if any.
        buildChildShapeTemplate(children[1], jsonProps.stroke) // Build the second shape template, if any.
    );
	*/

    return $(go.Node, 'Auto');
}
