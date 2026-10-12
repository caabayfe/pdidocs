(function(finding) {
    var targetProperty = 'glide.script_processor.admin';
    var expectedValue1 = 'admin';
    var expectedValue2 = 'security_admin';
    var expectedValue3 = 'maint';
    var defaultValue = 'admin';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue1.toLowerCase()) {
        if (propertyValue.toLowerCase() != expectedValue2.toLowerCase()) {
            if (propertyValue.toLowerCase() != expectedValue3.toLowerCase()) {
				var gr = new GlideRecord('sys_properties');
				gr.get('name', targetProperty);
				finding.setCurrentSource(gr);
                finding.increment();
            }
        }
    }
})(finding);
