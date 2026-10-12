function startPreview() {
	var dd = new GlideModal('hierarchical_progress_viewer', true, 800, 600);
	dd.setTitle("Finding sample of unreferenced records");
	dd.setPreference('sysparm_ajax_processor', 'AJAXUnreferencedPreviewWorker');
	dd.setPreference('sysparm_ajax_processor_rule_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_renderer_expanded_levels', '1');
	dd.setPreference('sysparm_button_close', 'Close');

	dd.on("executionStarted", function (response) {
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
			GlideUI.get().addOutputMessage({
				msg: "${Preview is still executing in the background. <a href='/sys_execution_tracker.do?sys_id=" + g_progress_id + "' target='_blank'>Click here</a> to see status.}",
				type: "info",
				id: 'unref_preview_in_progress'
			});
		} else {
			setTimeout(function() { reloadWindow(window); }, 200);
		}
	});

	dd.render();
}
