(function(finding) {
    var targetProperty = 'com.glide.security.check_unsanitized_html';
    var expectedValue = 'enforce';
    var defaultValue = 'log_only';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
