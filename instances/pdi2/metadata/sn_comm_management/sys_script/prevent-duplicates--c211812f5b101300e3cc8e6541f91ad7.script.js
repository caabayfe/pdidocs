(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var contactFields = ["contact_responsibility", "comm_plan_definition", "type", "sys_user", "sys_user_group", "recipients_list"];
	var gr = new GlideRecord("comm_contact_definition");
	for (var i in contactFields)
		gr.addQuery(contactFields[i], current[contactFields[i]]);

	if (gr.isValidField("csm_consumer"))
		gr.addQuery("csm_consumer", current["csm_consumer"]);

	gr.addQuery('sys_id','!=',current['sys_id']);
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("A duplicate Communication Contact Definition exists for the same Communication Plan Definition"));
		current.setAbortAction(true);
	}

})(current, previous);
