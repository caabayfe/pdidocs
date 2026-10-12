(function(finding) {
    var targetProperty = 'glide.sg.device_encryption_enabled';
    var expectedValue = 'true';

    // Default value is different based off of regulated instance property (GCC, etc.)
    var defaultValue = gs.getProperty('glide.regulated_instance', 'false');

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
