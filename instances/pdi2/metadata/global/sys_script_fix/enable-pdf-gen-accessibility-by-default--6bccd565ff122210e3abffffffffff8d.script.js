var propertyName = 'com.snc.pdf.generation.accessibility';
var propertyGR = new GlideRecord('sys_properties');

// Query for the system property by its old name
propertyGR.addQuery('name', propertyName);
propertyGR.query();

if (propertyGR.next()) {
    // Update the value and set the value to true
    propertyGR.value = 'true';
    propertyGR.update();
    gs.info('System property "' + propertyName +'" value updated to true.');
} else {
    gs.info('System property "' + propertyName + '" not found.');
}
