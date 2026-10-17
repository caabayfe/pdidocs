(function(finding) {
    var enabledPlugin = new GlidePluginManager().isActive('com.snc.zero_trust_session_access');
    var targetProperty = 'glide.authenticate.session_access.mobile.enabled';
    var expectedValue = 'true';
    var defaultValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (enabledPlugin) {
        enabledProperty = gs.getProperty('glide.authenticate.session_access.enabled', 'false');
        if (enabledProperty.toLowerCase() == 'true') {
            if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
                var gr = new GlideRecord('sys_properties');
                gr.get('name', targetProperty);
                finding.setCurrentSource(gr);
                finding.increment();
            }
        }
    }
})(finding);
