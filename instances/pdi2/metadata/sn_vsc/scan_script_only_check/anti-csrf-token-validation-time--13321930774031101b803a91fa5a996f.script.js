(function(finding) {
    var targetProperty = 'glide.security.csrf_previous.time_limit';
    var expectedValue = 86400;
    var defaultValue = 86400;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
