function findTracedDifferences() {
    var testResultIds = g_list.getChecked();
	if (!testResultIds) return;
    var testResultSysIds = testResultIds.split(",");
    if (testResultSysIds.length !== 2) {
        showErrorDialog();
        return;
    }

function showErrorDialog() {
    var DialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dialog = new DialogClass("glide_alert_standard");
    dialog.setPreference("title", new GwtMessage().getMessage("Select two test results to see traced differences"));
    dialog.setPreference("focusTrap", true);
    dialog.setTitle(new GwtMessage().getMessage("Error"));
    dialog.setPreference("warning", true);
    dialog.render();
}

function proceedToServer(testResultIds){
	var ga = new GlideAjax("ATFTracingHelperAjax");
	ga.addParam("sysparm_name", "getTracingTestResultDifferences");
	ga.addParam("sysparm_test_result_ids", testResultIds);
	ga.getXMLAnswer(function (answer) {
		if (!answer) return;
		window.location = "/sys_atf_test_result.do?sys_id=" + answer + "&sysparm_find_changes=true";
	});
}

function runSequentialTrackerChecks(testResultSysIds, callback, index = 0) {
    if (index >= testResultSysIds.length) {
        callback();
        return;
    }

    var ga = new GlideAjax("ATFTracingHelperAjax");
    ga.addParam("sysparm_name", "getTrackerId");
    ga.addParam("sysparam_sys_id", testResultSysIds[index]);

    ga.getXMLAnswer(function(answer) {
        if (answer) {
            var modal = new GlideModal("hierarchical_progress_viewer");
            modal.setTitle(new GwtMessage().getMessage("Loading changes since last successful run"));
            modal.setPreference("sysparm_renderer_execution_id", answer);
            modal.on("executionComplete", function() {
                runSequentialTrackerChecks(testResultSysIds, callback, index + 1);
            });
            modal.render();
        } else {
            runSequentialTrackerChecks(testResultSysIds, callback, index + 1);
        }
    });
}

// Sequentially run tracker check for both results
    runSequentialTrackerChecks(testResultSysIds, function() {
        proceedToServer(testResultIds);
    });

}
