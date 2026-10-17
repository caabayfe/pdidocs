(function(finding) {
    var targetProperty = 'sn_hr_core.restrict_guest_email';
    var expectedValue = 'true';
    var defaultValue = 'true'; //Default shipped is false, but getter defaults to true, so this value is true
    if (new GlidePluginManager().isActive('com.sn_hr_core')) {
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
