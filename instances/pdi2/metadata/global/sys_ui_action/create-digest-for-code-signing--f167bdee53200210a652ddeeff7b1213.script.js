function createDigest() {
	var ajaxHelper = new GlideAjax('com.glide.flow_designer.codesigning.FlowDesignerBatchJobProcessor');
	ajaxHelper.addParam('sysparm_sysid_csv', g_list.getChecked());
	ajaxHelper.addParam('sysparm_fd_table', 'sys_hub_action_type_definition');
	ajaxHelper.addParam('sysparm_fd_batch_job', 'CREATE_DIGEST');
	ajaxHelper.getXMLAnswer(getCreatingDigestResponse);
}

function getCreatingDigestResponse(answer) {
	try {
		if (answer == null)
			return;

		var separatorIndex = answer.indexOf(":");
		if (answer.substring(0, separatorIndex) == 'error') {
			alert("Error: " + answer.substring(separatorIndex + 1));
			return;
		}
		if (answer.substring(0, separatorIndex) != 'fd_background_worker_id') {
			alert('Error: Unexpected resposne: ' + answer);
			return;
		}

		var workerId = answer.substring(separatorIndex + 1);

		var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
		var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
		dd.setTitle("Create Digest");
		dd.setPreference('sysparm_renderer_execution_id', workerId);
		dd.setPreference('sysparm_renderer_expanded_levels', '0');
		dd.setPreference('sysparm_renderer_hide_drill_down', true);

		dd.on("bodyrendered", function (trackerObj) {

		});

		dd.on("executionComplete", function (trackerObj) {

		});

		dd.on("beforeclose", function () {
		});

		dd.render();
	} catch (err) {
		if (console)
			console.error(err);
	}
}
