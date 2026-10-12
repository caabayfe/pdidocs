(function(finding) {
    var targetProperty = 'glide.sc.req_for.roles.default';
    var expectedValue = 'deny';
    var defaultValue = 'deny';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
