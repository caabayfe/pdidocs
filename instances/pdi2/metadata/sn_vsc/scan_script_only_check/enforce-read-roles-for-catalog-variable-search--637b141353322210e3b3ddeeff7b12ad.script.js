(function(finding) {
    var targetProperty = 'glide.ais.ingestion.ignore_catalog_variables_read_roles';
    var expectedValue = 'false';
    var defaultValue  = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
