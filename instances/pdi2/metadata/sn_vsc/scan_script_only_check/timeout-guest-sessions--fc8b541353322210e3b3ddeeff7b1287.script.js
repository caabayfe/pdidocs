(function(finding) {
    var targetProperty = 'glide.guest.session_timeout';
    var expectedValue = 30;
    var defaultValue  = 0;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    // Need to validate if property value is a integer in the chance that
    // for some reason the value was improperly set by a user to a string value.
    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue || parseInt(propertyValue, 10) == 0) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
