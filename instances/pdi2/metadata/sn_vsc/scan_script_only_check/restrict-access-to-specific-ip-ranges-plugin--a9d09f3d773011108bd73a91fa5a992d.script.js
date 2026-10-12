(function(finding) {
    var active_plugin = GlidePluginManager.isActive('com.snc.ipauthenticator');
    //If the plugin is active, confirm there is at least 1 active IP based rule
    if (active_plugin) {
        var ip_access = new GlideRecord('ip_access');
        ip_access.addActiveQuery();
        ip_access.query();
        //If there are no active IP access entries this is a finding
        if (!ip_access.next()) {
            finding.setCurrentSource(ip_access);
            finding.increment();
        }
    } else {
        //The plugin is not active, this is a finding
        var gr1 = new GlideRecord('v_plugin');
        gr1.get('id', 'com.snc.ipauthenticator');
        finding.setCurrentSource(gr1);
        finding.increment();
    }
})(finding);
