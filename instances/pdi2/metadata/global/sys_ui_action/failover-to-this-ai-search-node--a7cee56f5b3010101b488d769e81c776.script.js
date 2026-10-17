function failover() {
    jslog("Running failover function");
    var dd = new GlideDialogWindow("simple_progress_viewer", false, "40em", "10em");
    dd.setTitle("AIS Failover");
    // Specify AJAX processor to use (which will actually initiate the test)
    dd.setPreference('sysparm_ajax_processor', 'AisFailoverAjax');
    dd.setPreference('sysparm_renderer_progress_title', "Swapping AIS Connection Permissions");
    dd.setPreference('sysparm_failover_target_connection', gel('sys_uniqueValue').value);
    dd.setPreference('sysparm_button_close', "Close and Refresh List");
    dd.on("executionComplete", function(trackerObj) {
        var closeBtn = $("sysparm_button_close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                window.location.reload();
                dd.destroy();
            };
        }
    });
    dd.on("beforeclose", function() {
        window.location.reload();
    });
    dd.render();
}
