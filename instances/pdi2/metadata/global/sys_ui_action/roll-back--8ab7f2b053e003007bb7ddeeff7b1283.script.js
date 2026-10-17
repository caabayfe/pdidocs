function confirmRollback() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_modal_confirm', true, 'modal-alert');
	dialog.setTitle('Rollback Appplication');
	dialog.setPreference('body', 'Are you sure you want to rollback? This is a destructive action and cannot be reverted.');
	dialog.setPreference('buttonLabelCancel', 'Cancel');
	dialog.setPreference('buttonLabelComplete', 'Rollback');
	dialog.setPreference('buttonClassComplete', 'btn btn-destructive');
	dialog.setPreference('onPromptComplete', startRollback);
	dialog.render();
}

function startRollback() {
	var ga = new GlideAjax("AjaxAppManager");
	ga.addParam("sysparam_ajax_function",'getRollbackContextId');
	ga.addParam("appid",g_form.getValue('name'));
	ga.addParam("version",g_form.getValue('version'));
	ga.getXMLAnswer(processRollbackContext);
}

function getRollbackDenialReason() {
	var ga = new GlideAjax("AjaxAppManager");
	ga.addParam("sysparam_ajax_function",'getRollbackDenialReason');
	ga.addParam("appid",g_form.getValue('name'));
	ga.addParam("version",g_form.getValue('version'));
	return ga.getXMLAnswer(showDenialPrompt);
}

function showDenialPrompt(denialReason) {
	console.log('denialReason is >> ' + denialReason);
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_modal_info', true, 'modal-alert');
	dialog.setTitle('Cannot rollback application');
	dialog.setPreference('body', 'Application rollback was denied: ' + denialReason);
	dialog.on("beforeclose", function() {
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});
	dialog.render();
}
function redirectToRollbackLogs(rctxid) {
	var ga = new GlideAjax("AjaxAppManager");
	ga.addParam("sysparam_ajax_function",'getRollbackRunId');
	ga.addParam("rollback_context_id",rctxid);
	ga.getXMLAnswer(function(rollbackRunId) {
		window.location = 'sys_rollback_log_list.do?sysparm_query=rollback_run%3D' + rollbackRunId;
	});
}

function processRollbackContext(rctxid) {

	if (!rctxid) {
		getRollbackDenialReason();
		return;
	}


    GlideUI.get().addOutputMessage({
				msg: "About to start rollback for: " + g_form.getValue('name'),
				type: "info",
				id: 'rollback_in_progress'
			});

	var dd = new GlideModal('hierarchical_progress_viewer', true, 800, 600);
	dd.setTitle('Application rollback');

	// Set AJAX processor and its preferences
	dd.setPreference('sysparm_ajax_processor', 'AJAXRollbackWorker');
	dd.setPreference('sysparm_ajax_processor_context_id', rctxid);

	dd.setPreference('sysparm_renderer_expanded_levels', '1'); // collapsed root node by default

	// Add a Close button to show when complete
	dd.setPreference('sysparm_button_showlogs', 'Show Logs');
	// Add a Close button to show when complete
	dd.setPreference('sysparm_button_close', 'Close');

	// Bind to progress viewer events
	dd.on("executionStarted", function (response) {
		// Store progress id in case something goes wrong
		var progress_id = response.responseXML.documentElement.getAttribute("answer");
	});

	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = document.getElementById("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
		var showLogsBtn = document.getElementById("sysparm_button_showlogs");
		if (showLogsBtn) {
			showLogsBtn.onclick = function() {
				redirectToRollbackLogs(rctxid);
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
