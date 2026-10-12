(function(finding) {
    var targetProperty = 'com.glide.security.referrerpolicy';
    var expectedValue = 'default';
    var defaultValue = 'default';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
