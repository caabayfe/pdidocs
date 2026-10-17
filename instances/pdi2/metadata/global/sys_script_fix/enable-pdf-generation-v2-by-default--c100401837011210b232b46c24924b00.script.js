var oldPropertyName = 'com.snc.pdf.html2pdf.newflow.enabled';
var newPropertyName = 'com.snc.pdf.generation.v2.enabled';
var propertyGR = new GlideRecord('sys_properties');

// Query for the system property by its old name
propertyGR.addQuery('name', oldPropertyName);
propertyGR.query();

if (propertyGR.next()) {
    // Update the name and set the value to true
    propertyGR.name = newPropertyName;
    propertyGR.value = 'true';
    propertyGR.update();
    gs.info('System property "' + oldPropertyName + '" renamed to "' + newPropertyName + '" and value updated to true.');
} else {
    gs.info('System property "' + oldPropertyName + '" not found.');
}
