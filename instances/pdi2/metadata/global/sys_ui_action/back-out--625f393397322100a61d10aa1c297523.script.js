var backOutInProgress = false;

function processUpdateSetBackOutWithVersion(control) {
	if (backOutInProgress)
		return;
	var msgConfirm = new GwtMessage().getMessage("Back Out Update Set");
	var isHUS = (g_scratchpad.base_update_set_id != null && g_scratchpad.base_update_set_id != '');
	var hasParent = (g_scratchpad.parent_set_id != null && g_scratchpad.parent_set_id != '');
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_confirm_update_set_backout');
	var updateSetId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	dialog.setTitle(msgConfirm);
	dialog.setWidth(450);
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('update_set_sys_id', updateSetId);
	dialog.setPreference('onPromptComplete', this.backoutUpdateSet);
	dialog.render();
}

function backoutUpdateSet(performRollback) {
	backOutInProgress = true;
	var updateSetId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	if (updateSetId == null)
		return;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var map = new GwtMessage().getMessages(["Back Out", "Close", "Backing out update set: {0}", "Backing out and rolling back app installs in update set: {0}"]);
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "15em");
	dd.setTitle(map["Back Out"]);
	dd.setPreference('focusTrap', true);
	dd.setPreference('sysparm_push_id', updateSetId);
	dd.setPreference('sysparm_progress_name', new GwtMessage().format(map[performRollback == "true" ? "Backing out and rolling back app installs in update set: {0}" : "Backing out update set: {0}"], g_form.getValue('name')));
	dd.setPreference('sysparm_backout_type', 'update_set');
	dd.setPreference('sysparm_perform_rollback', performRollback);
	dd.setPreference('sysparm_ajax_processor', 'AJAXPushBackOutWorker');
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
		backOutInProgress = false;
	});

	dd.on("beforeclose", function() {
		var uset = new GlideRecord('sys_update_set');
		if (uset.get(updateSetId))
			GlideURL.refresh();
		else {
			var redirectUrl = new GlideURL('sys_update_set_list.do');
			window.location.replace(redirectUrl.getURL());
		}
	});

	dd.render();
}
