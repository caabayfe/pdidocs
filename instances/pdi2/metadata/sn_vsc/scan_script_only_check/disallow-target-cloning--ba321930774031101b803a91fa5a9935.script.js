(function(finding) {
    var targetProperty = 'glide.db.clone.allow_clone_target';
    var expectedValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, 'true');

    // We've been asked to attempt to evaluate production/subproduction with this.
    // Setting default here to "production" to take a secure by default approach
    // If we don't have an instance type, instance is production, and we should limit clone target
    var instanceType = gs.getProperty("sn_appclient.instance_type", "production");

    if ((instanceType.toLowerCase() == 'production') && (propertyValue.toLowerCase() != expectedValue.toLowerCase())) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
