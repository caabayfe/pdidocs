function testMlConnection() {
    // check for unsaved changes
    if (g_form.modified) {
        g_form.addErrorMessage(getMessage("You have unsaved changes. Save them before testing the ML connection"));
        return false;
    }

    var connectionSysId = g_form.getUniqueValue();
    var dd = new GlideDialogWindow("hierarchical_progress_viewer", false, "40em", "10em");
    dd.setTitle("AI Search ML Connection Test");

    // Specify AJAX processor to use (which will actually initiate the test)
    dd.setPreference('sysparm_ajax_processor', 'AisMlConnectionTestAjax');
    dd.setPreference('sysparm_ajax_processor_connection_sysid', connectionSysId);

    // Bind to events
    dd.on("executionComplete", function(trackerObj) {});
    dd.on("beforeclose", function() {});

    // Show popup
    dd.render();
}
