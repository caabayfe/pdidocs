var rollbackInProgress = false;

function processUpdateSetRollbackWithVersion() {
	if (rollbackInProgress)
		return;
			
	var msgConfirm = new GwtMessage().getMessage("Confirm Rollback");
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_confirm_update_set_rollback');
	// get the update set from scratchpad:remote_update_set_props since the field is not in the form
	var updateSetId = typeof g_scratchpad != 'undefined' && g_scratchpad != null ? g_scratchpad.update_set : null;
	dialog.setTitle(msgConfirm);
	dialog.setWidth(450);	
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('update_set_sys_id', updateSetId);	
	// passed to dialog callback function
	dialog.setPreference('onPromptComplete', this.rollbackUpdateSet);
	dialog.render();
}

function rollbackUpdateSet(rollbackId) {
	rollbackInProgress = true;
	var remoteUpdateSetId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	if (remoteUpdateSetId == null)
		return;

	if (rollbackId == null) {
		return;
	}
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var map = new GwtMessage().getMessages(["Rollback", "Close"]);
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "15em");
	dd.setTitle(map["Rollback"]);
	dd.setPreference('focusTrap', true);
	dd.setPreference('sysparm_ajax_processor_context_id', rollbackId);	
	dd.setPreference('sysparm_ajax_processor', 'AJAXRollbackWorker');
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
		rollbackInProgress = false;
	});

	dd.on("beforeclose", function() {
		var uset = new GlideRecord('sys_remote_update_set');
		if (uset.get(remoteUpdateSetId))
			GlideURL.refresh();
		else {
			var redirectUrl = new GlideURL('sys_update_set_list.do');
			window.location.replace(redirectUrl.getURL());
		}
	});
	
	dd.render();
}
