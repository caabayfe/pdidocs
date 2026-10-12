var rollbackId;
var batchName;

function getRollbackInformation() {
	var pluginId = g_form.getUniqueValue();
	
	var batchRollbackHelper = new GlideAjax('BatchRollbackHelper');
	batchRollbackHelper.addParam('sysparm_name', 'getRollbackInformation');
	batchRollbackHelper.addParam('sysparm_id', pluginId);
	batchRollbackHelper.addParam('sysparm_type', 'application');
	batchRollbackHelper.getXML(confirmRollback);
}

function confirmRollback(answer) {
	var response = answer.responseXML.documentElement.getAttribute('answer');
	// Something went wrong
	// BatchRollbackHelper will add all appropriate failure messages
	if (response == null)
		return;
	
	var info = JSON.parse(response);
	batchName = info.name;
	rollbackId = info.rollback_context;
	// Can't rollback without a context
	if (rollbackId == null)
		return;
	
	var batchItems = info.plugins;
	// Nothing to rollback
	if (!batchItems)
		return;
	
	var warningMsg = "Performing this operation will rollback all of the following apps/plugins:: \n";
	for (var i = 0; i < batchItems.length; ++i) 
		warningMsg += batchItems[i] + (i + 1 == batchItems.length ? "" : ",\n");
	
	var dialog = new GlideDialogWindow('glide_confirm_standard');
	dialog.setTitle(new GwtMessage().getMessage('Confirm Rollback'));
	dialog.setPreference('warning', true);
	dialog.setPreference('title', new GwtMessage().getMessage(warningMsg));
	dialog.setPreference('defaultButton', 'ok_button');
	dialog.setPreference('onPromptComplete', startRollback.bind(this));
	dialog.render();
}

function startRollback() {
	dd = new GlideModal('hierarchical_progress_viewer', true, 800, 600);
	dd.setTitle("Rolling back: " + batchName);
	
	// Set AJAX processor and its preferences
	dd.setPreference('sysparm_ajax_processor', 'AJAXRollbackWorker');
	dd.setPreference('sysparm_ajax_processor_context_id', rollbackId);

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
