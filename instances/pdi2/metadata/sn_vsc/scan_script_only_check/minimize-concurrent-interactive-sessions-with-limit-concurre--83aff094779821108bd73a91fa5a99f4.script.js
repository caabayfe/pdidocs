(function(finding) {
    var isConcurrentSessionPluginActive = GlidePluginManager.isActive('com.glide.limit.concurrent.sessions');
    if (isConcurrentSessionPluginActive) {
        var targetProperty = 'glide.authenticate.max.concurrent.interactive.sessions';
        var expectedValue = 1;
        var defaultValue = 1;
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
