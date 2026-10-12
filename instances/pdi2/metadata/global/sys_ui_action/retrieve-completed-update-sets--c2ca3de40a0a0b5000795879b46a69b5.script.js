function retrieveCompletedRemoteSets(control) {
	if (typeof g_list != 'undefined' && typeof rowSysId == 'undefined') {
		//this executes when you are retrieving from the dropdown menu
		var selSysIds = g_list.getChecked().split(',');
		var numSel = selSysIds.length;
		var i = 0;
		if (numSel == 1) {
			//If there is only one from a list view, show the dialog
			getRetrieveUpdateSetsResponse(selSysIds[0]);
		}
		else {
			//If there is multiple - run their job and alert them how to view them
			while (i < numSel) {
				var ajaxHelper = new GlideAjax('UpdateSetAjax');
				ajaxHelper.addParam('sysparm_type', 'retrieveUpdateSets');
				ajaxHelper.addParam('sysparm_id', selSysIds[i]);
				ajaxHelper.getXMLAnswer(multiRetreiveResponse);
				i++;
			}
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			var dialog = new dialogClass('glide_info', false);
			dialog.setTitle("Retrieving update sets from multiple Remote Instances");
			dialog.setPreference('title', "To view progress open the Remote Instance record and click 'Show Status'");
			dialog.render();
		}
	} else {
		getRetrieveUpdateSetsResponse(rowSysId);
	}
}

function getRetrieveUpdateSetsResponse(sysId) {
	if (sysId == null) {
		if (typeof g_form == 'undefined')
			return;

		sysId = g_form.getUniqueValue();
		if (sysId == null)
			return;
	}
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
	dd.setTitle("Retrieve Update Sets");
	dd.setPreference('sysparm_ajax_processor', 'UpdateSetAjax');
	dd.setPreference('sysparm_type', 'retrieveUpdateSets');
	dd.setPreference('sysparm_id', sysId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
		
	dd.setPreference('sysparm_button_close', "Close");
		
	dd.on("executionStarted", function(response) {
	var trackerId = response.responseXML.documentElement.getAttribute("answer");
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
				ajaxHelper.addParam('sysparm_tracker_id', trackerId);
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
	
	dd.on("bodyrendered", function(trackerObj) {
			var closeBtn = $("sysparm_button_close");
			if (closeBtn)
				closeBtn.disable();
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

function multiRetreiveResponse(response) {
	//Does nothing on multi-source response
}
