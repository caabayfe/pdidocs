(function(finding) {
    var targetProperty = 'glide.service_portal.enable_acls_for_encoded_query_in_list';
    var expectedValue = 'true';
    var defaultValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
