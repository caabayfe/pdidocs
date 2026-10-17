(function(finding) {
    var targetProperty = 'com.glide.import_set_api.insert_multiple_optimize';
    var expectedValue = 'false';
    var defaultValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    if (propertyValue.toLowerCase() !== expectedValue.toLowerCase()) {
        finding.increment();
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
    }
})(finding);
