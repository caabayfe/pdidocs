(function(finding) {
    var pluginManager = new GlidePluginManager();
    if (pluginManager.isActive('com.snc.integration.sso.multi.installer')) {
        var targetProperty = 'glide.sso.acr.enabled';
        var expectedValue = 'true';
        var defaultValue = 'false';

        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
