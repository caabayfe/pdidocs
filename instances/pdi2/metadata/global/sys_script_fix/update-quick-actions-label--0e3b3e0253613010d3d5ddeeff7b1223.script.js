renameTable("quickactions_workspace_action", "Quick Action Toolbar Control", "Configurable Toolbar Control", "Configurable Toolbar Controls");

function renameTable(tableName, previousLabel, targetLabel, plural){

	if (pm.isZboot())
	  return;

	//Rename Sys Db Object
	gs.log("About to change label of " + tableName + " from " + previousLabel + " to " + targetLabel);
	var dbObj = new GlideRecord("sys_db_object");
	dbObj.addQuery("name",tableName);
	dbObj.query();
	if(dbObj.next()){
		var currentLabel = dbObj.getValue("label");
		if (currentLabel != previousLabel) {
			gs.log("No need to change label: current label=" + currentLabel +", expected=" + previousLabel);
			return;
		}
		dbObj.setValue("label",targetLabel);
		dbObj.update();
		gs.log("Changed label of " + tableName + " to " + targetLabel);
	} else {
		gs.log("Table " + tableName + " not found in sys_db_object");
	}
	
	// Modify plural in sys_documentation table
	var docObj = new GlideRecord("sys_documentation");
	docObj.addQuery("name",tableName);
	docObj.addNullQuery("element");
	docObj.query();
	if(docObj.next()){
		var currentPlural = docObj.getValue("plural");
		if (currentPlural != plural) {
			gs.log("Changing plural to " + plural);
			docObj.setValue("plural", plural);
			docObj.update();
		}
	} else {
		gs.log("Table " + tableName + " not found in sys_documentation");
	}
	
	gs.log("Done changing label of " + tableName);
}
