(function(finding) {
    var targetProperty = 'glide.apply.password_policy.on_login';
    var expectedValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, 'false');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
