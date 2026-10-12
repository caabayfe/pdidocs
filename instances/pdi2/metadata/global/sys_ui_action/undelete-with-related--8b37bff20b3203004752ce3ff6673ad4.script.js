function onPromptComplete(promptResponse) {
	if (promptResponse.toLowerCase() == "yes") {
		startRollback();
	}
}
function startRollback() {
	var dd = new GlideModal('hierarchical_progress_viewer', true, 800, 600);
	dd.setTitle("Recovering: " + g_form.getValue('display_value'));

	// Set AJAX processor and its preferences
	dd.setPreference('sysparm_ajax_processor', 'AJAXRollbackWorker');
	dd.setPreference('sysparm_ajax_processor_audit_delete_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default

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
		}
	});

	dd.render();
}
