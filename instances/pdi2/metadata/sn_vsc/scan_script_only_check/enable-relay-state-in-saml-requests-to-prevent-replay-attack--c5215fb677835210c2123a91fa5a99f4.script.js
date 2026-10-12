(function(finding) {
    var pluginManager = new GlidePluginManager();

    if (pluginManager.isActive('com.snc.integration.sso.multi.installer')) {
        var targetProperty = 'glide.authenticate.sso.saml2.enable_relay_state_with_id';
        var expectedValue = 'true';

        // If there is no Glide Property entry, the default value is set to 'false' in source code.
        var propertyValue = gs.getProperty(targetProperty, 'false');

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            if (gr.get('name', targetProperty)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
})(finding);
