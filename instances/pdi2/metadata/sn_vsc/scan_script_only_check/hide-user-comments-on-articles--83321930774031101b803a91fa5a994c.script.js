(function(finding) {
    var targetProperty = 'glide.knowman.show_user_feedback';
    var expectedValue = 'never';
    var defaultValue = 'onload';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
