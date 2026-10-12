(function(finding) {
    var targetProperty = 'glide.xmlutil.max_entity_expansion';
    var expectedValue = 3000;
    var defaultValue = 3000;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
          finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
