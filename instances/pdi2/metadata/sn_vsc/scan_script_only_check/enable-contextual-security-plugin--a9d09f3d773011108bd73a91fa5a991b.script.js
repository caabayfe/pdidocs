(function(finding) {
    var pluginId = 'com.glide.role_management';
    if (!GlidePluginManager.isActive(pluginId)) {
        var gr = new GlideRecord('v_plugin');
        gr.get('id', pluginId);
        finding.setCurrentSource(gr);
        finding.increment();
    }

})(finding);
