(function executeRule(current, previous /*null when async*/) {

    if(!current.getValue('destination_id') || !current.getValue('destination_table')) return;

	// Add your code here
	var gr = new GlideRecord('sys_notif_destination_type');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('destination_table', current.getValue('destination_table'));
	gr.addQuery('destination_id', current.getValue('destination_id'));
	gr.query();

	if(gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Please make sure to enter unique Destination Table and Destination Id values. Matching destination info found in \'{0}\' destination type.', [gr.getValue('name')]));
	}

})(current, previous);
