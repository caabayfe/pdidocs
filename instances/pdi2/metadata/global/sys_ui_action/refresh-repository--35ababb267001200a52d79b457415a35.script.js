function refreshRepo() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		refreshNav();
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});

	var map = new GwtMessage().getMessages(["Refresh Repository", "Close"]);

	dd.setTitle(map["Refresh Repository"]);

	dd.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	dd.setPreference('sysparm_ajax_processor_type','refresh_repo');
	dd.setPreference('sysparm_ajax_processor_sys_repo_config_id', rowSysId);

	dd.setPreference('sysparm_renderer_progress_title', map["Refresh Repository"]);
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
