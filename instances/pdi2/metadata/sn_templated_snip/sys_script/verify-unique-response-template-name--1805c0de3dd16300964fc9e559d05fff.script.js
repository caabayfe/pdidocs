(function executeRule(current, previous /*null when async*/) {

	var templateGR = new GlideRecord('sn_templated_snip_note_template');
	templateGR.addQuery('name', current.name);
	templateGR.addQuery('sys_id', '!=', current.getUniqueValue());
	templateGR.setLimit(1);
	templateGR.query();
	
	if (templateGR.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Template with name '{0}' already exists.", current.name));
		current.setAbortAction(true);
	}

})(current, previous);
