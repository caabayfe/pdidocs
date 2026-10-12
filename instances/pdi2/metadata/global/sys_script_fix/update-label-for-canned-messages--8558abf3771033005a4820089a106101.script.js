//API: renameTable(tableName, previousLabel, targetLabel)
renameTable('sys_email_canned_message','Email Client Canned Messages','Quick Message');
function renameTable(tableName, previousLabel, targetLabel){
	//Rename Sys Db Object
	gs.log("About to change label of " + tableName + " from " + previousLabel + " to " + targetLabel);
	var dbObj = new GlideRecord("sys_db_object");
	dbObj.addQuery("name",tableName);
	dbObj.addQuery("label",previousLabel);
	dbObj.query();
	if(dbObj.next()){
		dbObj.setValue("label",targetLabel);
		dbObj.update();
		gs.log("Changed label of " + tableName + " to " + targetLabel);
	} else {
		gs.log("Given combination of table "+tableName+" and label "+previousLabel+" not found in sys_db_object");
	}	
	gs.log("Done changing label of " + tableName);
}
