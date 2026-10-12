(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_destination_preference');
	gr.addQuery("destination_table", current.destination_table);
	gr.addQuery("destination", current.destination);
	gr.addQuery("destination_identifier_field", current.destination_identifier_field);
	if (current.operation() == 'update')
		gr.addQuery("sys_id", "!=", current.sys_id);
	gr.addQuery("destination_identifier_field", current.destination_identifier_field);
	gr.query();
	if (gr.next()) {
		gs.addInfoMessage(gs.getMessage("This destination preference already exists"));
		current.setAbortAction(true);
	}

})(current, previous);
