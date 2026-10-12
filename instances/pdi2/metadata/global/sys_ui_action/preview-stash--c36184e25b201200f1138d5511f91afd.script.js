function previewStash() {
	var map = new GwtMessage().getMessages(["Preview Stash", "Close",
			"A stash must be either in the Stashed or the Stash Backed Out state to be previewed"]);

	if (typeof rowSysId == 'undefined')
     sysId = gel('sys_uniqueValue').value;
	else
     sysId = rowSysId;
	
	var gr = new GlideRecord('sys_repo_stash');
	if (!gr.get(sysId)) {
		alert(map["Invalid record"]);
		return;
	}
	if (gr.state != 'stashed' && gr.state != 'stash_backed_out') {
		alert(map["A stash must be either in the Stashed or the Stash Backed Out state to be previewed"]);
		return;
	}

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		refreshNav();
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});

	dd.setTitle(map["Preview Stash"]);
	
	dd.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	dd.setPreference('sysparm_ajax_processor_type','preview_stash');
	dd.setPreference('sysparm_ajax_processor_sys_repo_stash_id', sysId);

	dd.setPreference('sysparm_renderer_progress_title', map["Preview Stash"]);
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});

	dd.render();
}
