(function(finding) {
    var targetProperty = 'glide.report.report_view.read_acl';
    var expectedValue = 'enforce';
    var defaultValue = 'enforce';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
