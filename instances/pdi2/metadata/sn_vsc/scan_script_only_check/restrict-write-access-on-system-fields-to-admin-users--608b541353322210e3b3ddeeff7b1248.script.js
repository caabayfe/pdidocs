(function(finding) {
    var targetProperty = 'glide.rest.table_api.admin_only_sys_fields';
    var expectedValue = 'true';
    var defaultValue  = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
