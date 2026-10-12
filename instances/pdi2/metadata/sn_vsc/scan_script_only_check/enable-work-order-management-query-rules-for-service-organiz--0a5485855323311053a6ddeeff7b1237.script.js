(function(finding) {
    var enabledPlugin = new GlidePluginManager().isActive('com.snc.work_management');
    var targetProperty = 'sn_fsm.use_query_rules';
    var expectedValue = 'true';
    var defaultValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (enabledPlugin) {
        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
