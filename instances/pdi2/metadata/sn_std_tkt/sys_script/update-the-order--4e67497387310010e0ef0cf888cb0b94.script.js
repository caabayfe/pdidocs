(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord()) {
		var gr = new GlideRecord('ticket_tab_configuration');
		gr.addQuery('parent', current.parent);
		gr.query();
		var count = gr.getRowCount();
		current.order = (count*10) + 10;
	}
})(current, previous);
