(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord(current.getTableName());
    gr.addQuery('employee_profile', current.getValue('employee_profile'));
    gr.addQuery('primary', current.getValue('primary'));
    gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addNullQuery('end_date'); 
    gr.query();
    if (gr.next()) {
    	var userN = GlideStringUtil.escapeHTML(gr.getDisplayValue("employee_profile.user"));
		gs.addErrorMessage(gs.getMessage("User '{0}' current job profile already has a primary job profile assigned.", userN));
        current.setAbortAction(true);
    }

})(current, previous);
