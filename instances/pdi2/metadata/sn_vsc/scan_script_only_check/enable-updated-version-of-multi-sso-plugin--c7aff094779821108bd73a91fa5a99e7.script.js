(function(finding) {
    var pluginManager = new GlidePluginManager();

    if (pluginManager.isActive('com.snc.integration.sso.multi.installer')) {
        // Both properties exist in Glide Properties table if com.snc.integration.sso.multi plugin is installed, 
        // but otherwise would not be included in default OOB instance
        var dependentProperty = 'glide.authenticate.multisso.enabled';
        var dependentValue = 'true';

        var targetProperty = 'glide.authenticate.multissov2_feature.enabled';
        var expectedValue = 'true';

        var propertyValue = gs.getProperty(targetProperty, 'false');
        var dependentPropertyValue = gs.getProperty(dependentProperty, 'false');

        // Insecure configuration if MultiSSO plugin is enabled, but MultiSSOv2 isn't being used as well
        if (dependentPropertyValue.toLowerCase() == dependentValue.toLowerCase() && (propertyValue.toLowerCase() != expectedValue.toLowerCase())) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
