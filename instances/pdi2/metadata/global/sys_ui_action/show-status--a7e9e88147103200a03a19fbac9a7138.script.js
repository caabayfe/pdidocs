function showProgress(control) {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	
	var ajaxHelper = new GlideAjax('ExecutionTrackerIDAjax');
	ajaxHelper.addParam('sysparm_ajax_processor_source_id', sysId);
	ajaxHelper.addParam('sysparm_ajax_processor_source_table', 'sys_remote_update_set');
	ajaxHelper.getXMLAnswer(getCommitRemoteUpdateSetResponse);
}

function getCommitRemoteUpdateSetResponse(answer) {
	if (answer == null)
		return;
	
	var workerId = answer;
	
	var map = new GwtMessage().getMessages(["Close", "Commit All Update Sets", "Cancel", "Are you sure you want to cancel this update set commit?"]);
	var sysId = typeof g_form != 'undefined' && g_form != null ? g_form.getUniqueValue() : null;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
	
	dd.setTitle(map["Commit All Update Sets"]);
	dd.setPreference('sysparm_renderer_execution_id', workerId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); //collapsed root node by default
	dd.setPreference('sysparm_renderer_hide_drill_down', true);
	dd.setPreference('sysparm_button_close', map["Close"]);
	
	dd.on("executionComplete", function(trackerObj) {
		
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});
	
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
				var response = confirm(map["Are you sure you want to cancel this update set commit?"]);
				if (response != true)
					return;
				
				var ajaxHelper = new GlideAjax('HierarchyUpdateSetCommitAjax');
				ajaxHelper.addParam('sysparm_ajax_processor_function', 'cancel');
				ajaxHelper.addParam('sysparm_worker_id', workerId);
				ajaxHelper.getXMLAnswer(getCancelRemoteUpdateSetResponse);
			};
			buttonsCell.appendChild(cancelBtn);
		});
	
	dd.on("beforeclose", function() {
		reloadWindow(window);
	});
	
	dd.render();
}

function getCancelRemoteUpdateSetResponse(answer) {
	if (answer == null)
		return;
	
	// Nothing really to do here.
}
