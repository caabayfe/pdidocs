function onProceed() {
	destroyDialog();
    var dd = new GlideModal('hierarchical_progress_viewer', true, 800, 600);
	dd.setTitle("Rolling back from: " + '${JS:sysparm_del_number}');

	// Set AJAX processor and its preferences
	dd.setPreference('sysparm_ajax_processor', 'AJAXRollbackWorker');
	dd.setPreference('sysparm_ajax_processor_context_id', '${JS:sysparm_del_roll_context}');

	dd.setPreference('sysparm_renderer_expanded_levels', '1'); // collapsed root node by default

	// Add a Close button to show when complete
	dd.setPreference('sysparm_button_close', 'Close');

	// Bind to progress viewer events
	dd.on("executionStarted", function (response) {
		// Store progress id in case something goes wrong
		g_progress_id = response.responseXML.documentElement.getAttribute("answer");
	});

	dd.on("executionComplete", function(trackerObj) {
		g_progress_id = null;
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				var updateState = new GlideAjax('AJAXUpdateDMTRollbackState');
				updateState.addParam('sysparm_name', 'setRollbackState');
				updateState.addParam('sysparm_dm_table', 'sys_dm_delete');
				updateState.addParam('sysparm_sysId', '${JS:sysparm_del_sys_id}');
				updateState.getXML();
				dd.destroy();
			};
		}
	});

	dd.on("beforeclose", function (){
		if (typeof g_progress_id === 'string') {
			// Execution has not completed, show user how they can continue to monitor status
			GlideUI.get().addOutputMessage({
				msg: "Rollback is still executing in the background. <a href='/sys_execution_tracker.do?sys_id=" + g_progress_id + "' target='_blank'>Click here</a> to see status.",
				type: "info",
				id: 'rollback_in_progress'
			});
		} else {
			// All done, reload to get any changes (i.e. state)
			setTimeout(function() { reloadWindow(window); }, 200);
		}
	});

	dd.render();
}

function cancel() {
	destroyDialog();
    return false;
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
