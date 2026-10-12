function onCancel() {
	GlideDialogWindow.get().destroy();
}

function onConvert() {
	var redirect = false;

	var progressViewerDlg = new GlideModal('hierarchical_progress_viewer', true);

	progressViewerDlg.on('beforeclose', function () {
		if (!redirect)
			GlideDialogWindow.get().destroy();
	});

	progressViewerDlg.on('executionComplete', function(trackerObj) {
		var button = $('sysparm_button_redirect');
		if (button) {
			button.className = 'btn btn-primary';
			button.onclick = function() {
				progressViewerDlg.destroy();
			};
		}
		
		if (trackerObj.state === '2') {
			redirect = true;
			showSuccessDialog();
			progressViewerDlg.destroy();
		} else
			redirect = false;
	});

	var appId = "$[sysparm_sys_id]";
	progressViewerDlg.setTitle(getMessage('Converting...'));
	progressViewerDlg.setPreference('sysparm_sys_id', appId);
	progressViewerDlg.setPreference('sysparm_function', 'convertToStoreApp');
	progressViewerDlg.setPreference('sysparm_progress_name', 'Converting application');
	progressViewerDlg.setPreference('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
	progressViewerDlg.setBackdropStatic(true);
	progressViewerDlg.setPreference('sysparm_button_redirect', getMessage('Close'));

	progressViewerDlg.render();
	GlideDialogWindow.get().destroy();

	return progressViewerDlg;
}

function showSuccessDialog() {
	var successDialog = new GlideModal('sn_appclient_convert_app_success');
	
	successDialog.setTitle(getMessage('Successfully converted!'));
	successDialog.setBackdropStatic(true);
	successDialog.render();
}
