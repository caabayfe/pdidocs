(function executeRule(current, previous /*null when async*/) {

	var templateGR = new GlideRecord('sn_templated_snip_note_template');
	templateGR.addQuery('short_name', current.short_name);
	templateGR.addQuery('table', current.table);
	templateGR.addQuery('sys_id', '!=', current.getUniqueValue());
	templateGR.setLimit(1);
	templateGR.query();
	
	if (templateGR.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Template with Short Name '{0}' already exists in table '{1}'.", [current.short_name, current.table]));
		current.setAbortAction(true);
	}
	
})(current, previous);
