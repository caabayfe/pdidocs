(function refineQuery(current, parent) {

	//dot walking is not working in relationship using regular query
	var gr = new GlideRecord("sys_upgrade_history_log");
	var fileName = "N/A";//if no history record do not return any tasks
	var upgradeStartTime = parent.sys_created_on; // curent record upgrade start time
	if (gr.get(parent.getValue("upgrade_detail"))) {
		fileName = gr.getValue("file_name");
		upgradeStartTime = gs.dateGenerate(gr.getDisplayValue("upgrade_history.upgrade_started"));
	}
	
	var encodedQuery = "upgrade_detail.file_name=" + fileName + "^upgrade_detail.upgrade_history.history_type=upgrade^sys_id!=" + parent.getUniqueValue();
	current.addEncodedQuery(encodedQuery);
	current.addQuery("sys_created_on", "<", upgradeStartTime); //fetch only records which are older than current upgrade

})(current, parent);
