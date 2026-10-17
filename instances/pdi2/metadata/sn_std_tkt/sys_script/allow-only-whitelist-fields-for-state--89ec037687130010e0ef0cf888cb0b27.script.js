(function executeRule(current, previous /*null when async*/) {
	
	var notAllowedFields = "number,short_description,sys_created_on,sys_updated_on,	sys_mod_count,watch_list,comments,comments_and_work_notes,work_notes,work_notes_list,user_input";
	notAllowedFields = notAllowedFields.replace(/\s/g,'');
	notAllowedFields = notAllowedFields.split(',');
	var stateField = current.state_field + '';
	
	if (notAllowedFields.indexOf(stateField) >= 0) {
        current.setAbortAction(true);
        var gr = new GlideRecord(current.table);
        gs.addErrorMessage(gs.getMessage("'{0}' is not allowed in state mapping", gr.getElement(stateField).getED().getLabel()));
    }
})(current, previous);
