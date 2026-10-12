
function onCancel() {
	GlideDialogWindow.get().destroy();
}

function onSync(stashMessage) {
	var redirect = false;

	var progressViewerDlg = new GlideModal('hierarchical_progress_viewer', true);
	progressViewerDlg.setPreference('sysparm_renderer_expanded_levels', '0');

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
	});

	var repoId = "$[sysparm_sys_id]";
	progressViewerDlg.setTitle(getMessage('Sync Repository'));
	progressViewerDlg.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	progressViewerDlg.setPreference('sysparm_ajax_processor_type','import');
	progressViewerDlg.setPreference('sysparm_ajax_processor_sys_repo_config_id', repoId);
	progressViewerDlg.setPreference('sysparm_ajax_processor_stash_message', stashMessage);
	progressViewerDlg.setPreference('sysparm_ajax_processor_branch_name', "");
	progressViewerDlg.setPreference('sysparm_ajax_processor_even_if_has_outgoing_changes', "true");
	progressViewerDlg.setPreference('sysparm_ajax_processor_import_with_disk_diff', "true");
	progressViewerDlg.setBackdropStatic(true);
	progressViewerDlg.setPreference('sysparm_button_redirect', getMessage('Close'));

	progressViewerDlg.render();
	GlideDialogWindow.get().destroy();

	return progressViewerDlg;
}
