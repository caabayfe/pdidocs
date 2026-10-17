(function executeRule(current, previous /*null when async*/) {

	var glRec = new GlideRecord('fx_configuration');
	glRec.addQuery('target_table', current.target_table);
	glRec.addQuery('target_field', current.target_field);
	glRec.addQuery('sys_id', '!=', current.sys_id);
	glRec.query();
	if (glRec.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("FX Configuration for table '{0}' and field '{1}' already exists.", [current.target_table, current.target_field]));
		current.setAbortAction(true);
	}

})(current, previous);
