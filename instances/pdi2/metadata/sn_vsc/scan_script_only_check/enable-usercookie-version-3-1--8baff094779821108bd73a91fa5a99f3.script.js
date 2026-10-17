(function(finding) {
    var targetProperty = 'glide.ui.secure.cookies.use_kmf';
    var expectedValue = 'true';

    // Property is set to "false" by default in source code
    var propertyValue = gs.getProperty(targetProperty, 'false');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
