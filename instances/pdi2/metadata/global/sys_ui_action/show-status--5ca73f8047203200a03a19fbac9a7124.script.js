function showProgress(){
	var sysId = rowSysId;
	var workerId = g_scratchpad.update_source_tracker_id;
	var createdOn = g_scratchpad.update_source_tracker_created_on;
	if (workerId == null || workerId == "undefined")
		return;
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
	if (createdOn == null || createdOn == "undefined")
		dd.setTitle("Retrieve Update Sets");
	else
		dd.setTitle("Retrieve Update Sets started on: " + createdOn);
	dd.setPreference('sysparm_renderer_execution_id', workerId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
		
	dd.setPreference('sysparm_button_close', "Close");
		
	dd.on("bodyrendered", function(response) {
		var cancelBtn = new Element("button", {
			'id': 'sysparm_button_cancel',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update("Cancel");
		
		cancelBtn.onclick = function() {
			var dialog = new GlideDialogWindow('glide_ask_standard');
			dialog.setTitle("Confirmation");
			dialog.setPreference('warning', true);
			dialog.setPreference('title', "Are you sure you want to cancel this update set retrieve?");
			dialog.setPreference('defaultButton', 'ok_button');
			dialog.setPreference('onPromptComplete', function() {
				cancelBtn.disable();
				var ajaxHelper = new GlideAjax('UpdateSetAjax');
				ajaxHelper.addParam('sysparm_type', 'cancelRetrieve');
				ajaxHelper.addParam('sysparm_tracker_id', workerId);
				ajaxHelper.getXMLAnswer(_handleCancelRetrieveResponse);
			});
			dialog.render();
			dialog.on("bodyrendered", function() {
				var okBtn = $("ok_button");
				if (okBtn) {
					okBtn.className += " btn-destructive";
				}
			});
        };
		
		var _handleCancelRetrieveResponse = function(answer) {
			var cancelBtn = $("sysparm_button_cancel");
			if (cancelBtn)
				cancelBtn.remove();
		};

        var buttonsPanel = $("buttonsPanel");
        if (buttonsPanel)
        	buttonsPanel.appendChild(cancelBtn);
	});
		
	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.enable();
			closeBtn.onclick = function() {
				dd.destroy();
				reloadWindow(window);
			};
		}
		
		var cancelBtn = $("sysparm_button_cancel");
		if (cancelBtn)
			cancelBtn.remove();
	});
	
	dd.render();
}
