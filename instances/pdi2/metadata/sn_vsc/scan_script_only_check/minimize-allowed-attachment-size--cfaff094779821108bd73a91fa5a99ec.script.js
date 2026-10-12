(function(finding) {
    var targetProperty = 'com.glide.attachment.max_size';
    var expectedValue = 1024;
    var defaultValue = 1024;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    // Need to validate if property value is a integer in the chance that
    // for some reason the value was improperly set by a user to a string value.
    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
