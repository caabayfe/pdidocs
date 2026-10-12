(function(finding) {
    var pluginId = 'com.snc.system_security';
    if (!GlidePluginManager.isActive(pluginId)) {
        var gr = new GlideRecord('v_plugin');
        gr.get('id', pluginId);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
