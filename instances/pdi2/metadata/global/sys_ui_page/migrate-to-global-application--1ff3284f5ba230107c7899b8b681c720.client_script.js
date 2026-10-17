function onCancel() {
	GlideDialogWindow.get().destroy();
}

var newAppDiv = gel("newApp");
var existingAppDiv = gel("existingApp");
var newAppInputBox = gel("target_app_name");

function onMigrate() {
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
	});

	progressViewerDlg.setTitle(getMessage('migrate_global_progress_view'));
	progressViewerDlg.setPreference('sysparm_selected_records_count', '$[selectedRecordsCount.toString()]');

	if (gel('radio-existing-app').checked) {
		var app = gel('app_picker');
		progressViewerDlg.setPreference('sysparm_sys_app', app.value);
		if ('$[sysTableName]' == 'sys_update_xml') {
			progressViewerDlg.setPreference('sysparm_function', 'addToApp');
			progressViewerDlg.setPreference('sysparm_sys_id', '$[globalUpdatesArray.toString()]');
		} else if ('$[sysTableName]' == 'sys_update_set') {
			progressViewerDlg.setPreference('sysparm_function', 'addUpdateSetToApp');
			progressViewerDlg.setPreference('sysparm_sys_id', '$[globalUpdateSetsArray.toString()]');
		} else {
			progressViewerDlg.setPreference('sysparm_function', '');
		}
	} else {
		progressViewerDlg.setPreference('sysparm_sys_app_name', newAppInputBox.value);
		if ('$[sysTableName]' == 'sys_update_xml') {
			progressViewerDlg.setPreference('sysparm_function', 'createAppAndAddCustomerUpdatesToApp');
			progressViewerDlg.setPreference('sysparm_sys_id', '$[globalUpdatesArray.toString()]');
		} else if ('$[sysTableName]' == 'sys_update_set') {
			progressViewerDlg.setPreference('sysparm_function', 'createAppAndAddUpdateSetToApp');
			progressViewerDlg.setPreference('sysparm_sys_id', '$[globalUpdateSetsArray.toString()]');
		} else {
			progressViewerDlg.setPreference('sysparm_function', '');
		}
	}

	progressViewerDlg.setPreference('sysparm_progress_name', 'Migrating updates');
	progressViewerDlg.setPreference('sysparm_ajax_processor', 'com.glide.metadata.global_app.GlobalAppMoverAjaxProcessor');
	progressViewerDlg.setBackdropStatic(true);
	progressViewerDlg.setPreference('sysparm_button_redirect', getMessage('Close'));

	progressViewerDlg.render();
	GlideDialogWindow.get().destroy();

	return progressViewerDlg;
}

$('newApp').observe('input',
		function () {
			if (existingAppDiv.style.display === "none") {
				if (newAppInputBox.value === "")
					$('ok_button').disable();
				else
					$('ok_button').enable();
			}
		}
);

function updateButton() {
	if (existingAppDiv.style.display === "block") {
		var selectedApp = gel('app_picker').value;
		if (selectedApp == '')
			$('ok_button').disable();
		else
			$('ok_button').enable();
	}
}

function showNewAppInputBox() {
	newAppDiv.style.display = "block";
	existingAppDiv.style.display = "none";
	if (newAppInputBox.value === "")
		$('ok_button').disable();
	else
		$('ok_button').enable();
}

function showExistingAppInputBox() {
	newAppDiv.style.display = "none";
	existingAppDiv.style.display = "block";
	var selectList = gel('app_picker').value;
	if (selectList === "")
		$('ok_button').disable();
	else
		$('ok_button').enable();
}
