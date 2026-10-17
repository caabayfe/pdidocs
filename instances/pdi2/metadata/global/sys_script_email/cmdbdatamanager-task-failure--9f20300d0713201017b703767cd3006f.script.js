(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	/**
	*   Event - cmdbdatamanager.task.failed
	*   current - cmdb_data_management_task record
	*   parm1 - run_as user sys_id and all cmdb data manager admins sys_id comma separated (email recipients)
	*   parm2 - policy sys_id
	**/
	
	var policyId = current.policy_id ? current.policy_id : event.parm2;
	var policyName;
	// BODY
	if (policyId) {
		var policyRec = new GlideRecord("cmdb_data_management_policy");
		policyRec.get(policyId);
		policyName = policyRec.name;
	} else {
		policyName = "";
	}
	var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/data-manager-policy-details/' + policyId + '">' + policyName + '</a>';
	template.print("Link to policy: " + url + '<br><br>');
	template.print(current.close_notes ? ("Failure details: " + current.close_notes) : "No additional details were included" + '<br>');

})(current, template, email, email_action, event);
