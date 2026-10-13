(function executeRule(current, previous /*null when async*/) {

	var rec = new GlideRecord(current.getTableName());
	rec.addQuery("execute_on", current.execute_on);
	rec.addQuery("mid_server", current.mid_server);
	rec.addQuery("mid_server_cluster", current.mid_server_cluster);
	rec.addQuery("sys_id", "!=", current.sys_id);
	rec.query();
	
	if (rec.next()) { //there is already an extension for that MID
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("Cannot define an extension if an extension of the same type already exists on the same MID Server."));	
	}


})(current, previous);
