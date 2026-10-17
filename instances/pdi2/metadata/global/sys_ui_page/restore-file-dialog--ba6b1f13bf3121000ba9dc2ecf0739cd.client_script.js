var RestoreFileDialog = Class.create({
	
	initialize: function () {
	},
	
	restoreFile: function () {
		var metadataDeleteId = '$[metadataDeleteId]';
		var metadataId = '$[metadataId]';
		var metadataTable = '$[metadataTableName]';
		var numActiveModules = 0;
		var refreshAppPicker = false;
		
		var dd = new GlideDialogWindow("hierarchical_progress_viewer", false, "30em", "10.5em");
		dd.on("executionStarted", function(response) {
			numActiveModules = response.responseXML.documentElement.getAttribute("num_active_modules");
			refreshAppPicker = response.responseXML.documentElement.getAttribute("refresh_app_picker");
		});
		dd.on("beforeclose", function () {
			this.exitCompleted(metadataId, metadataTable, numActiveModules, refreshAppPicker);
		}.bind(this));
		
		dd.setTitle("Progress");
		dd.setPreference('sysparm_function', 'restore_metadata');
		dd.setPreference('sysparm_sys_id', metadataDeleteId);
		dd.setPreference('sysparm_ajax_processor', 'com.snc.metadata.restore.MetadataRestoreAjaxProcessor');
		dd.setPreference('sysparm_show_done_button', 'true');
		
		dd.render();
		GlideDialogWindow.get().destroy();
		
		return dd;
	},
	
	exit: function() {
		GlideDialogWindow.get().destroy();
	},
	
	exitCompleted: function (metadataId, metadataTable, numActiveModules, refreshAppPicker) {
		// If we restored a custom app, refresh the app picker
		if(refreshAppPicker) {
			var top = getTopWindow();
			if (typeof top.g_application_picker != 'undefined')
				top.g_application_picker.fillApplications();
		}
		
		var ga = new GlideAjax('com.snc.metadata.restore.MetadataRestoreAjaxProcessor');
		ga.addParam('sysparm_function', 'num_active_modules');
		ga.getXML(function(response) {
			if(numActiveModules != response.responseXML.documentElement.getAttribute("num_active_modules"))
				CustomEvent.fireTop('navigator.refresh');
			var url = new GlideURL(metadataTable + '.do?sys_id=' + metadataId);
			if('sys_app' == metadataTable)
				window.location.replace('change_current_app.do?app_id=' + metadataId + '&referrer=' + url.getURL() + '&sysparm_ck=' + '$[gs.getSessionToken()]');
			else
				window.location.replace(url.getURL());
		});
	}
});

//$('restore_file_dialog_container').observe('keyup',
//function (event) {
//	var elem = event.element();
//	if (event.keyCode == 27) // escape
//		gRestoreFileDialog.exit();
//}
//);

var gRestoreFileDialog = new RestoreFileDialog();
