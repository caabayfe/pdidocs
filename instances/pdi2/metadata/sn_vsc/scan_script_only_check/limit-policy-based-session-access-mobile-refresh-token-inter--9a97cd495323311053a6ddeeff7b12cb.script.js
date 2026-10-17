(function(finding) {
    var enabledPlugin = new GlidePluginManager().isActive('com.snc.zero_trust_session_access');
    var targetProperty = 'glide.authenticate.session_access.mobile.refresh_token_interval';
    var expectedValue = 1800;
    var defaultValue = 1800;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    // Only check if Zero Access is enabled
    if (enabledPlugin) {
        enabledProperty = gs.getProperty('glide.authenticate.session_access.enabled', 'false');
        if (enabledProperty.toLowerCase() == 'true') {
            if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
                var gr = new GlideRecord('sys_properties');
                gr.get('name', targetProperty);
                finding.setCurrentSource(gr);
                finding.increment();
            }
        }
    }
})(finding);
