(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord(current.getTableName());
	gr.addActiveQuery();
	if(current.operation() != 'insert')
		gr.addQuery('sys_id', '!=', current.sys_id); // exclude current record
	gr.addQuery('content', current.content);
	gr.addQuery('notification', current.notification); // for this notification and content
	gr.setLimit(1);
	gr.query();
	if(gr.next()) {
		gs.addErrorMessage(gs.getMessage(" There is already an active Actionable Content record for the selected content."));
		current.setAbortAction(true);
	}

})(current, previous);
