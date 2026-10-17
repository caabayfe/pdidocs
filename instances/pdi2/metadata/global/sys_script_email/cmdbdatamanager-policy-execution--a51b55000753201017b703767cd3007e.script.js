(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	/**
	*   Event - cmdbdatamanager.evaluation.failed
	*   current - cmdb_data_management_policy_execution record
	*   parm1 - run_as user sys_id and call cmdb data manager admins comma separated (email recipients)
	*   parm2 - policy sys_id
	**/
	
	// BODY
	if (!current.cmdb_policy) {
		// get the policyId from parm2
		var policyRec = new GlideRecord("cmdb_data_management_policy");
		policyRec.get(event.parm2);
		current.cmdb_policy = policyRec.getUniqueValue();
		current.cmdb_poliy.name = policyRec.name;
	}
	var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/data-manager-policy-details/' + current.cmdb_policy + '">' + current.cmdb_policy.name + '</a>';
	template.print("Link to policy: " + url + '<br><br>');

	template.print(current.execution_summary ? ("Summary details: " + current.execution_summary) : "No additional details were included" + '<br>');

})(current, template, email, email_action, event);
