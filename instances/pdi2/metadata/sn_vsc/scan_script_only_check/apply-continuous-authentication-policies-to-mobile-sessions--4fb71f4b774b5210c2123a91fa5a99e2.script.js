(function(finding) {
    var pluginManager = new GlidePluginManager();
    var enabledPlugin = pluginManager.isActive('com.snc.zero_trust_continuous_authentication');

    var targetProperty = 'glide.zta.high_assurance.mobile.session.allowed';
    var expectedValue = 'false';
    var defaultValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (enabledPlugin) {
        enabledProperty = gs.getProperty('glide.zta.continuous_authentication.enabled', 'false');
        if (enabledProperty.toLowerCase() == 'true') {
            if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
                var gr = new GlideRecord('sys_properties');
                if (gr.get('name', targetProperty)) {
                    finding.setCurrentSource(gr);
                }
                finding.increment();
            }
        }
    }
})(finding);
