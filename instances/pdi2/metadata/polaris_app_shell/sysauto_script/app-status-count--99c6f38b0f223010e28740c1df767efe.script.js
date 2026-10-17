(function() {
    if (gs.getProperty('glide.ui.polaris.experience', 'false') == 'false')
        return;

    var globalAppsData = new sn_appclient.AppsDataAPI();
    var appCounts = globalAppsData.getAppCounts();

    addRow("Ready to install", appCounts.notInstalled);
    addRow("Ready to update", appCounts.updated);

    function addRow(status, count) {
        var gr = new GlideRecord('polaris_app_shell_app_counts');
        gr.addQuery('status', status);
        gr.query();
        if (gr.next()) {
            gr.setValue('status_count', count);
            gr.update();
        } else {
            gr.setValue('status', status);
            gr.setValue('status_count', count);
            gr.insert();
        }
    }
}());
