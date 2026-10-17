(function executeRule(current, previous /*null when async*/) {
	if (current != null) {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('table_name', 'ml_model_artifact');
		gr.addQuery('table_sys_id', current.getUniqueValue());
		gr.query();
		if (gr.next()) {
			gr.deleteRecord();
		} else {
			gs.warn('Unable to find attachment');
		}
	}
})(current, previous);
