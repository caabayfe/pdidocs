function showProgress(control) {
	var ajaxHelper = new GlideAjax('ExecutionTrackerIDAjax');
	ajaxHelper.addParam('sysparm_ajax_processor_source_id', g_scratchpad.update_set_id);
	ajaxHelper.addParam('sysparm_ajax_processor_source_table', 'sys_update_set');
	ajaxHelper.getXMLAnswer(getCommitRemoteUpdateSetResponse);
}

function getCommitRemoteUpdateSetResponse(answer) {
	try {
		if (answer == null)
			return;
		
		var map = new GwtMessage().getMessages(["Close", "Cancel", "Are you sure you want to cancel this update set?", "Update Set Commit"]);
		
		var workerId = answer;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
		dd.setTitle(map["Update Set Commit"]);
		dd.setPreference('sysparm_renderer_execution_id', workerId);
		dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
		dd.setPreference('sysparm_renderer_hide_drill_down', true);
		
		dd.setPreference('sysparm_button_close', map["Close"]);
		
		dd.on("bodyrendered", function(trackerObj) {
			var buttonsPanel = $("buttonsPanel");
			var table = new Element("table", {cellpadding: 0, cellspacing: 0, width : "100%"});
			buttonsCell = table.appendChild(new Element("tr")).appendChild(new Element("td"));
			buttonsCell.align = "right";
			buttonsPanel.appendChild(table);
			
			var closeBtn = $("sysparm_button_close");
			if (closeBtn)
				closeBtn.disable();
			
			var cancelBtn = new Element("button");
			cancelBtn.id = "sysparm_button_cancel";
			cancelBtn.type = "button";
			cancelBtn.innerHTML = map["Cancel"];
			cancelBtn.onclick = function() {
				var response = confirm(map["Are you sure you want to cancel this update set?"]);
				if (response != true)
					return;
				
				var ajaxHelper = new GlideAjax('UpdateSetCommitAjax');
				ajaxHelper.addParam('sysparm_type', 'cancelRemoteUpdateSet');
				ajaxHelper.addParam('sysparm_worker_id', workerId);
				ajaxHelper.getXMLAnswer(getCancelRemoteUpdateSetResponse);
			};
			buttonsCell.appendChild(cancelBtn);
		});
		
		dd.on("executionComplete", function(trackerObj) {
			var closeBtn = $("sysparm_button_close");
			if (closeBtn) {
				closeBtn.enable();
				closeBtn.onclick = function() {
					dd.destroy();
				};
			}
			
			var cancelBtn = $("sysparm_button_cancel");
			if (cancelBtn)
				cancelBtn.hide();
		});
		
		dd.on("beforeclose", function() {			
			var top = getTopWindow();
			if (typeof top.g_application_picker != 'undefined')
				top.g_application_picker.fillApplications();
			
			reloadWindow(window); //reload current form after closing the progress viewer dialog
		});
		
		dd.render();
	} catch (err) {

	}
}

function getCancelRemoteUpdateSetResponse(answer) {
	if (answer == null)
		return;
	
	// Nothing really to do here.
}
