(function(finding) {

    var pluginManager = new GlidePluginManager();
    var enabledPlugin = pluginManager.isActive('com.sn_disco_certmgmt');
    if (enabledPlugin) {

        var targetProperty = 'sn_disco_certmgmt.private_key_size';

        var expectedValue = 2048;
        var defaultValue = 2048;
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        // Finding if key size is less than 2048
        if (isNaN(propertyValue) || parseInt(propertyValue, 10) < expectedValue) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
