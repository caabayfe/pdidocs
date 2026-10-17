(function(finding) {
    var targetProperty = 'glide.oauth.state.parameter.required';
    var expectedValue = 'true';

    // If not found in Glide Property table, it will default to "false" in source code.
    var propertyValue = gs.getProperty(targetProperty, 'false');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
