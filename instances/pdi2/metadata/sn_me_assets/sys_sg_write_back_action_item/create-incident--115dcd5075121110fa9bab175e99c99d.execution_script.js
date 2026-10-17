(function WriteBackAction(parm_input, parm_variable) {
	var gr = new GlideRecord('incident');
	gr.initialize();
	gr.setValue('short_description', parm_input.short_description);
	gr.setValue('caller_id', gs.getUserID());
	gr.setValue('urgency', parm_input.urgency);
	gr.setValue('contact_type', 'phone');
	gr.setValue('description', gs.getMessage('Problem with my "{0}"', parm_variable.display_name));
	if(!gs.nil(parm_variable.cmdb_ci))
		gr.setValue('cmdb_ci', parm_variable.cmdb_ci);
	gr.insert();
})(parm_input, parm_variable);
