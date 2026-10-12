(function(finding) {
    var isConcurrentSessionPluginActive = GlidePluginManager.isActive('com.glide.limit.concurrent.sessions');
    if (isConcurrentSessionPluginActive) {
        var targetProperty = 'glide.authenticate.limit.concurrent.sessions.across.all.nodes';
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
