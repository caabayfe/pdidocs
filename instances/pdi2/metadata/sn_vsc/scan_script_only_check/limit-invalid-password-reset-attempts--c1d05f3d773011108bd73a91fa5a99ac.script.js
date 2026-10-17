(function(finding) {
    var targetProperty = 'password_reset.request.max_attempt';
    var expectedValue = 3;
    var defaultValue = 3;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
