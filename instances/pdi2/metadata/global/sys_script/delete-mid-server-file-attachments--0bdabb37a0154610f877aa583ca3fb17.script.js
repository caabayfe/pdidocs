(function executeRule(current, previous /*null when async*/) {
	gs.log("Deleting attachments for table: " + current.getTableName() + ", sys_id: " + current.getUniqueValue());
	var gr = new GlideRecord('sys_attachment');
	gr.addQuery('table_name', current.getTableName());
	gr.addQuery('table_sys_id', current.getUniqueValue());
	gr.query();
	gr.deleteMultiple();
})(current, previous);
