function onClick_testConnection(configId) {
	var dd = new GlideDialogWindow("hierarchical_progress_viewer", false, "40em", "10em");
	dd.setTitle("Endpoint Connection Test");

	// Specify AJAX processor to use (which will actually initate the test)
	dd.setPreference('sysparm_ajax_processor', 'AJAXClothoConnectionTest');
	dd.setPreference('sysparm_ajax_processor_config_id', configId);

	// Bind to events
	dd.on("executionComplete", function (trackerObj) {});
	dd.on("beforeclose", function () {});

	// Show popup
	dd.render();
}
