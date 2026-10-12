(function(finding) {
    var targetProperty = 'glide.db.encoded_query.check_function_field_query_acls';
    var expectedValue = 'true';
    var defaultValue  = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
