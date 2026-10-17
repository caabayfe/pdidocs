(function() {
	
	if (pm.isZboot())
		return; //Only run for upgrade
	
	var fieldLabelArray = [];
	// add json object containing old field label and new field label
	fieldLabelArray.push({"element" : "origin_type", "oldLabel" : "Origin Type", "newLabel" : "Artifact Type", "plural": "Artifact Types" });
	fieldLabelArray.push({"element" : "app_scope", "oldLabel" : "App Scope", "newLabel" : "Artifact Scope", "plural": "Artifact Scopes" });
	
	var tableName = "outbound_request_usage_metrics";
	
	for (var i = 0; i < fieldLabelArray.length ; i++) {
		var labelJsonObj = fieldLabelArray[i];
		//another for loop should be ok as Array length is 2
		var oldLabel = labelJsonObj.oldLabel.toString();
		var newLabel = labelJsonObj.newLabel.toString();
		var element = labelJsonObj.element.toString();
		var plural = labelJsonObj.plural.toString();
		
		gs.log("Changing field label of " + tableName + "['"+ element + "'] from " + oldLabel + " to " + newLabel);
		if(!GlideTableDescriptor.isValid(tableName))
			return;
		
		var gr = new GlideRecord('sys_dictionary');
		gr.addQuery('name', tableName);
		gr.addQuery('element', element);
		gr.addQuery('column_label', oldLabel);
		gr.query();
		if (gr.next()) {
			gr.setValue('column_label', newLabel);
			gr.setWorkflow(false);
			gr.update();
		}
		gr = new GlideRecord('sys_documentation');
		gr.addQuery('name', tableName);
		gr.addQuery('element', element);
		gr.addQuery('language', 'en');
		gr.addQuery('label', oldLabel);
		gr.query();
		if (gr.next()) {
			gr.setValue('label', newLabel);
			gr.setValue('plural', plural);
			gr.setWorkflow(false);
			gr.update();
		}
		gs.log("Done changing field label of " + tableName + "['"+ element + "']");
	}
})();
