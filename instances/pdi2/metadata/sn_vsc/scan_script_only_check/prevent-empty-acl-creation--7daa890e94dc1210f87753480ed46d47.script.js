(function(finding) {
    var targetProperty = 'glide.security.empty_acl.popup_window.enabled';
    var fallbackBehavior = '';
    var secureValue = 'true';

    var pluginManager = new GlidePluginManager();
    if (!pluginManager.isActive('com.glide.high_security')) {
        var grPlugin = new GlideRecord('v_plugin');
        if (grPlugin.get('id', 'com.glide.high_security')) {
            finding.setCurrentSource(grPlugin);
        }
        finding.increment();
        return;
    }

    var propertyValue = gs.getProperty(targetProperty, fallbackBehavior);
    if (propertyValue != secureValue) {
        /* case-sensitive */
        var grProp = new GlideRecord('sys_properties');
        if (grProp.get('name', targetProperty)) {
            finding.setCurrentSource(grProp);
        }
        finding.increment();
        return;
    }
})(finding);
