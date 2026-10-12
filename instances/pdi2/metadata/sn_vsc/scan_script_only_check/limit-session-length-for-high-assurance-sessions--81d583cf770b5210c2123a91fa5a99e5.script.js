(function(finding) {
    var pluginManager = new GlidePluginManager();
    if (pluginManager.isActive('com.snc.zero_trust_continuous_authentication')) {
        enabledProperty = gs.getProperty('glide.zta.continuous_authentication.enabled', 'false');
        if (enabledProperty.toLowerCase() == 'true') {
            var targetProperty = 'glide.zta.high_assurance.session.timeout';
            var expectedValue = 30;
            var defaultValue = 30;
            var propertyValue = gs.getProperty(targetProperty, defaultValue);

            if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
                var gr = new GlideRecord('sys_properties');
                if (gr.get('name', targetProperty)) {
                    finding.setCurrentSource(gr);
                }
                finding.increment();
            }
        }
    }
})(finding);
