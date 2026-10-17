(function(finding) {

    var pluginId = 'sn_report_acl';
    if (!GlidePluginManager.isActive(pluginId)) {
        var gr = new GlideRecord('v_plugin');
        gr.get('id', pluginId);
        finding.setCurrentSource(gr);
        finding.increment();
    }

})(finding);
