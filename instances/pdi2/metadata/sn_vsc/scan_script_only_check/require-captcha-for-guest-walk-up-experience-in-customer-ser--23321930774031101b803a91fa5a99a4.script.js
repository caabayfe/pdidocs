(function(finding) {

    var pluginManager = new GlidePluginManager();

    //If the relevant store app is active
    if (pluginManager.isActive('sn_guest_walkup_cs')) {

        var targetProperty = 'sn_guest_walkup_cs.captcha.enabled';
        var expectedValue = 'true';
        var defaultValue = 'true';

        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
