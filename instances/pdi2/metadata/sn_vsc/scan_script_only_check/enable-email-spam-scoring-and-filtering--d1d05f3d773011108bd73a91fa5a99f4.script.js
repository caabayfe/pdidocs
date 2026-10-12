(function(finding) {
    var dependentProperty = 'glide.email.read.active';
    var dependentValue = 'true';
    var fallbackValue = 'true';
    var propertyValue = gs.getProperty(dependentProperty, fallbackValue);

    var targetPluginActive = GlidePluginManager.isActive('com.glide.email_filter');

    if ((propertyValue.toLowerCase() == dependentValue.toLowerCase()) && !targetPluginActive) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', dependentProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
