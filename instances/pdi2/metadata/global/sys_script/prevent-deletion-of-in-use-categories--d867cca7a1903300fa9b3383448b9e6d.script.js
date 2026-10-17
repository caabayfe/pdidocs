(function executeRule(current, previous /*null when async*/) {
	var id = current.getValue('sys_id');
	gs.print('sys_id: ' + id);
	var gr = new GlideRecord('sys_cb_topic');
	
	gr.addQuery('category', id);
	gr.query();
	var matching = gr.getRowCount();
	if (matching > 0) {
		current.setAbortAction(true);
		var topicNames = [];
		while (gr.next()) {
			topicNames.push(gr.getValue('name'));
		}
		
		var msg = gs.getMessage('The category "{0}" is currently is use by the following topic(s), and cannot be deleted: {1}', [GlideStringUtil.escapeHTML(current.getValue('name')), topicNames.join(', ')]);
		gs.addErrorMessage(msg);
	}
})(current, previous);
