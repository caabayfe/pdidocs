(function(finding) {
    var isConcurrentSessionPluginActive = GlidePluginManager.isActive('com.glide.limit.concurrent.sessions');
    if (isConcurrentSessionPluginActive) {
        var targetProperty = 'glide.authenticate.limit.concurrent.interactive.sessions';
        var expectedValue = 'true';

        // Property is set to "false" by default in source code
        var propertyValue = gs.getProperty(targetProperty, 'false');

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
