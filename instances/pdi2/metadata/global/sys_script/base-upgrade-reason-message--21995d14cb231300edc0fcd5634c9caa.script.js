(function executeRule(current, previous /*null when async*/) {
	var reason = "";
	switch(String(current.disposition)) {
		case "201": 
			reason = "inserted";
			break;
		case "202":
			reason = "updated";
			break;
		case "203":
			reason = "deleted";
			break;
	}
	
	var gr = new GlideRecord("sys_copied_base_upgrade_log_mapping");
	gr.addQuery("copied_record_upgrade_log", current.sys_id);
	gr.query();
	if (!gr.next())
		return;

	var baselog = new GlideRecord("sys_upgrade_history_log");
	if (!baselog.get(gr.getValue("base_record_upgrade_log")))
		return;
	
	var link_text = baselog.getValue("file_name");
	var link = current.getTableName()+".do?sys_id="+gr.getValue("base_record_upgrade_log");
	
	gs.addInfoMessage(gs.getMessage("We added this upgrade history log because base record <a {0}> {1} </a> was {2}",["href="+link, link_text, reason]));

})(current, previous);
