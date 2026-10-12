(function executeRule(current, previous /*null when async*/) {
	if (current != null) {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name', 'ml_update_set');
		gr.addQuery('table_sys_id', current.getUniqueValue());
		gr.query();
		if (gr.next()) {
			gr.deleteRecord();
		} else {
			gs.error('Unable to find attachment');
		}
	}
})(current, previous);
