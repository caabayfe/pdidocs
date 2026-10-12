(function(finding) {
    var pluginManager = new GlidePluginManager();
    if (pluginManager.isActive('com.snc.contextual_search')) {
        var targetProperty = 'com.snc.contextual_search.cxs_new_window.force_relative_link';
        var expectedValue = 'true';
        var defaultValue  = 'false';
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
