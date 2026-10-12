function onCancel() {
	GlideDialogWindow.get().destroy();
}

function onConvert() {

	var redirect = false;

	var progressViewerDlg = new GlideModal('hierarchical_progress_viewer', true);

	progressViewerDlg.on('beforeclose', function () {
		if (redirect)
			this.goToCustomAppPage();
		
		GlideDialogWindow.get().destroy();
	}.bind(this));

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
		} else
			redirect = false;
	}.bind(this));

	var appId = "$[sysparm_sys_id]";
	progressViewerDlg.setTitle(getMessage('Converting...'));
	progressViewerDlg.setPreference('sysparm_sys_id', appId);
	progressViewerDlg.setPreference('sysparm_function', 'convertToDevelopmentApp');
	progressViewerDlg.setPreference('sysparm_progress_name', 'Converting Store application');
	progressViewerDlg.setPreference('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
	progressViewerDlg.setBackdropStatic(true);
	progressViewerDlg.setPreference('sysparm_button_redirect', getMessage('Close'));

	progressViewerDlg.render();
	GlideDialogWindow.get().destroy();

	return progressViewerDlg;
}

function goToCustomAppPage(appId) {
	var url = new GlideURL('sys_app.do?sys_id=' + '$[sysparm_sys_id]');
    window.location.href = url.getURL();
}
