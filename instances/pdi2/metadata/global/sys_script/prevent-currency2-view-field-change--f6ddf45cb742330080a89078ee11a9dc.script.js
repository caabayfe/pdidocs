(function executeRule(current, previous /*null when async*/) {
	if (current.name.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('No table name exists.'));
	} else {
		var gr = new GlideRecord('fx_currency2_instance');
		gr.addQuery('table', current.name);
		gr.addQuery('field', current.element);
		gr.query();
		if (gr.hasNext()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Rows exist in the table, column {0} cannot be modified.', current.element));
		}
	}

})(current, previous);
