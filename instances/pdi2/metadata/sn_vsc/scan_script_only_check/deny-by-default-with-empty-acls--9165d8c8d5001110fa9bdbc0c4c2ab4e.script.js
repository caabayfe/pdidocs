(function(finding) {
    var targetProperty = 'glide.sm.default_mode';
    var expectedValue = 'deny';
    var pluginManager = new GlidePluginManager();
    var defaultValue;

    // In practice, if High Security plugin is enabled, wildcard ACLs still prevent access if property is undefined
    // So we can say defaultValue is deny for simplicity
    if (pluginManager.isActive('com.glide.high_security')) {
        defaultValue = 'deny';
    } else {
        defaultValue = 'allow';
    }

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
