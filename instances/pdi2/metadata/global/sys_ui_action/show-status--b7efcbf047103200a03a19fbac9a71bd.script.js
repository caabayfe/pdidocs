function showProgress() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	
	var ajaxHelper = new GlideAjax('ExecutionTrackerIDAjax');
	ajaxHelper.addParam('sysparm_ajax_processor_source_id', sysId);
	ajaxHelper.addParam('sysparm_ajax_processor_source_table', 'sys_remote_update_set');
	ajaxHelper.getXMLAnswer(getRemoteUpdateSetPreviewResponse);
}

function getRemoteUpdateSetPreviewResponse(answer) {
	if (answer == null)
		return;
	var workerId = answer;
	
	var MESSAGE_KEY_DIALOG_TITLE = "Remote Update Set";
	var MESSAGE_KEY_PROGRESS_TITLE = "Remote Update Set Status";
	var MESSAGE_KEY_CLOSE_BUTTON = "Close";
	var MESSAGE_KEY_CANCEL_BUTTON = "Cancel";
	var MESSAGE_KEY_CONFIRMATION = "Confirmation";
	var MESSAGE_KEY_CANCEL_CONFIRM_DIALOG_TILE = "Are you sure you want to cancel this update set preview?";
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_DIALOG_TITLE, MESSAGE_KEY_PROGRESS_TITLE, MESSAGE_KEY_CLOSE_BUTTON, MESSAGE_KEY_CANCEL_BUTTON, MESSAGE_KEY_CONFIRMATION, MESSAGE_KEY_CANCEL_CONFIRM_DIALOG_TILE]);

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", true, "40em", "10em");

	dd.setTitle(messageMap[MESSAGE_KEY_DIALOG_TITLE]);
	dd.setPreference('sysparm_renderer_execution_id', workerId);
	dd.setPreference('sysparm_renderer_progress_title', messageMap[MESSAGE_KEY_PROGRESS_TITLE]);
	dd.setPreference('sysparm_renderer_bubble_up_messages', true);
	dd.setPreference('sysparm_renderer_allow_shrink', true);
	dd.setPreference('sysparm_renderer_expanded_levels', false);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); //collapsed root node by default
	dd.setPreference('sysparm_button_close', messageMap[MESSAGE_KEY_CLOSE_BUTTON]);

    dd.on("renderStatus", function(response) {
		var cancelBtn = $("sysparm_button_cancel");
		if (!cancelBtn) {
			cancelBtn = new Element("button", {
				'id': 'sysparm_button_cancel',
				'type': 'button',
				'class': 'btn btn-default',
				'style': 'margin-left: 5px; float:right;'
			}).update(messageMap[MESSAGE_KEY_CANCEL_BUTTON]);

			cancelBtn.onclick = function() {
				var dialog = new GlideDialogWindow('glide_ask_standard');
				dialog.setTitle(messageMap[MESSAGE_KEY_CONFIRMATION]);
				dialog.setPreference('warning', true);
				dialog.setPreference('title', messageMap[MESSAGE_KEY_CANCEL_CONFIRM_DIALOG_TILE]);
				dialog.setPreference('defaultButton', 'ok_button');
				dialog.setPreference('onPromptComplete', function() {
					cancelBtn.disable();
					var ajaxHelper = new GlideAjax('UpdateSetPreviewAjax');
					ajaxHelper.addParam('sysparm_ajax_processor_function', 'cancelPreview');
					ajaxHelper.addParam('sysparm_ajax_processor_tracker_id', workerId);
					ajaxHelper.getXMLAnswer(_handleCancelPreviewResponse);
				});
				dialog.render();
				dialog.on("bodyrendered", function() {
					var okBtn = $("ok_button");
					if (okBtn) {
						okBtn.className += " btn-destructive";
					}
				});
			};

			var _handleCancelPreviewResponse = function(answer) {
				// nothing really to do here
			};

            var buttonsPanel = $("buttonsPanel");
            if (buttonsPanel)
        	    buttonsPanel.appendChild(cancelBtn);
		}
	});

	dd.on("executionComplete", function(trackerObj) {
		var cancelBtn = $("sysparm_button_cancel");
		if (cancelBtn)
			cancelBtn.remove();

		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});
	
	dd.on("beforeclose", function() {
		reloadWindow(window);
	});
	
	dd.render();
}
