var DeleteAppDialog = Class.create({
	
	deleteApp: function () {
		if (!this.reconfirm(new GwtMessage().getMessage("To delete application and all of its files"))) {
			return false;
		}
		
		var appId = '$[sysId]';
		var workerId;
		var refreshNav = false;

		var dd = new GlideModal("hierarchical_progress_viewer", true);
		
		dd.on("executionStarted", function(response) {
			workerId = response.responseXML.documentElement.getAttribute("answer");
			refreshNav = response.responseXML.documentElement.getAttribute("refresh_nav");
		});
		
		dd.on("beforeclose", function () {
			this.exitCompleted(workerId, appId, refreshNav);
		}.bind(this));
		
		dd.setTitle("Progress");
		dd.setPreference('sysparm_function', 'deleteApplication');
		dd.setPreference('sysparm_sys_id', appId);
		dd.setPreference('sysparm_delete_all', 'true');
		dd.setPreference('sysparm_progress_name', "Deleting application");
		dd.setPreference('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
		dd.setPreference('sysparm_show_done_button', 'true');
		dd.setPreference('sysparm_delete_ide_source_files', 'true');

		dd.render();
		GlideDialogWindow.get().destroy();
		
		return dd;
	},
	
	exit: function() {
		GlideDialogWindow.get().destroy();	
	},
	
	reconfirm: function (message) {
		var keyword = new GwtMessage().getMessage("delete").toLowerCase();
		var fieldMsg = new GwtMessage().format("Type the word \"{0}\" here", keyword);
		var name = prompt(message, fieldMsg);
		if (!name || name.toLowerCase() != keyword)
			return false;
		
		return true;
	},
	
	exitCompleted: function (workerId, appId, refreshNav) {
		// If we changed any menu structure, refresh the nav
		if(refreshNav)
			CustomEvent.fireTop('navigator.refresh');
		
		// Always refresh app picker when we delete an app
		var top = getTopWindow();
		if (typeof top.g_application_picker != 'undefined')
			top.g_application_picker.fillApplications();
		
		var url = new GlideURL('$mycompanyappsmgmt.do');
		if("$[jvar_compatibility]" === "block")
		   url = new GlideURL('sys_app_list.do');
		window.location.href = url.getURL();

	}
});

$('delete_app_dialog_container').observe('keyup',
function (event) {
	if (event.keyCode == 27) // escape
		gDeleteAppDialog.exit();
}
);

$('go_to_app_files').observe('mouseup',
function (event) {
	var url = new GlideURL('sys_metadata_list.do');
	url.addParam('sysparm_query', 'sys_class_name!=sys_metadata_delete^sys_scope=$[sysId]');
	window.location = url.getURL();
}
);

var gDeleteAppDialog = new DeleteAppDialog();
