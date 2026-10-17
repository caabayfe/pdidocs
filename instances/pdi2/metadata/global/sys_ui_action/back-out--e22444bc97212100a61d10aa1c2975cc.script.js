function processPushBackOutWithVersion(control) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass('glide_confirm_standard');
	dialog.setTitle(new GwtMessage().getMessage('Confirmation'));
	dialog.setPreference('warning', true);
	dialog.setPreference('title', new GwtMessage().format("The back out process can undo a large amount of work and cannot be undone.  Continue with the back out process?"));
	dialog.setPreference('onPromptComplete', this.backoutPush);
	dialog.render();
}

function backoutPush() {
	var pushId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	if (pushId == null)
		return;

	var map = new GwtMessage().getMessages(["Back Out", "Close"]);
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var pwindow = new dialogClass("hierarchical_progress_viewer", false, "40em", "15em");
	pwindow.setTitle(map["Back Out"]);
	pwindow.setPreference('sysparm_button_close', map["Close"]);
	pwindow.on("executionComplete", function(trackerObj) {
		if (trackerObj.state != "2") {
			var closeBtn = $("sysparm_button_close");
			if (closeBtn) {
				closeBtn.onclick = function() {
					pwindow.destroy();
				};
			}
			return;
		}	
		reloadWindow(window);
	});

	pwindow.on("beforeclose", function() {
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});
	pwindow.setPreference('sysparm_push_id', pushId);
	pwindow.setPreference('sysparm_progress_name', "Backing out push: " + g_form.getValue('name'));
	pwindow.setPreference('sysparm_ajax_processor', 'AJAXPushBackOutWorker');
	pwindow.render();
}
