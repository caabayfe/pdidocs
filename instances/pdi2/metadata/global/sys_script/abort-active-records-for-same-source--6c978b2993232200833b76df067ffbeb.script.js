(function executeRule(current, previous /*null when async*/) {

	var rec = new GlideRecord(current.getTableName());
	rec.addActiveQuery();
	rec.addQuery("source", current.source);
	rec.addQuery("sys_id", "!=", current.sys_id);
	rec.query();
	
	if (rec.next()) { //there is already an extension for that MID
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Cannot create an event grouping definition for source {0} as an active definition for that source already exists.", GlideStringUtil.escapeHTML(current.source)));	
	}
	
})(current, previous);
