(function(finding) {
    var pluginManager = new GlidePluginManager();

    if (pluginManager.isActive('com.glide.domain.msp_extensions.installer')) {
        var targetProperty = 'glide.sys.domain.include_domain_condition_on_join';
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
