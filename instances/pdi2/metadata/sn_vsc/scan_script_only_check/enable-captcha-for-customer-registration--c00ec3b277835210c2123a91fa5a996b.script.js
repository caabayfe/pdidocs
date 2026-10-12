(function(finding) {

    var pluginManager = new GlidePluginManager();

    var targetProperty = 'sn_customerservice.captchaEnabled';
    var expectedValue = 'true';
    var defaultValue = 'true';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (pluginManager.isActive('com.snc.cs_base') && propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
