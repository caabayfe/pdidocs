(function(finding) {
    var targetProperty = 'glide.soapfault.display_stack_trace';
    var expectedValue = 'false';
    var defaultValue = 'false';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
