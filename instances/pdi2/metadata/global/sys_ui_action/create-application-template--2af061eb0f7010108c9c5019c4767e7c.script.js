function scanApp() {
	
	//Scan the app
	var scanner = new GlideAjax('PayloadScannerAJAX'); 
	scanner.addParam('sysparm_name','scanCurrentApplication'); 
	scanner.addParam('sysparm_source_id', g_form.getUniqueValue());
	scanner.addParam('sysparm_source_name', "sys_app");
	scanner.addParam('sysparm_reuse_template_app', true);
	scanner.getXML(ResponseFunction); 
	
	function ResponseFunction(response) { 
		var progressWorkerId = response.responseXML.documentElement.getAttribute("answer"); 
		if (progressWorkerId) {
			//Show the progress worker dialog
			var dialogClass = window.GlideDialog ? GlideDialog : GlideDialogWindow;
			var dialog = new dialogClass("hierarchical_progress_viewer", false, "40em", "10em");
			dialog.setTitle("Creating Application Template...");
			dialog.setPreference('sysparm_renderer_execution_id', progressWorkerId);
			dialog.render();
		}
	}
	
}
