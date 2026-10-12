function testConnection() {
	// Grab the original data from the server
	var connectionData = {};
	for (var attr in g_scratchpad.connectionData) {
		if (g_scratchpad.connectionData.hasOwnProperty(attr))
			connectionData[attr] = g_scratchpad.connectionData[attr];
	}
		
	// Update  data with values from the form
	for (var idx = 0; idx < g_form.elements.length; idx++) {
		var fieldName = g_form.elements[idx].fieldName;
		connectionData[fieldName] = g_form.getValue(fieldName);
	}
		
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	dialog = new dialogClass("test_connection");		
	dialog.setTitle("Test Connection");
	dialog.setSize(350,300);		
	dialog.setPreference("connection_data", JSON.stringify(connectionData));
	dialog.setNologValue(true);
	dialog.render();	
}
