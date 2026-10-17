(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
						/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
						/* Optional GlideRecord */ event) {
    
	/**
	*   event - sn_cmdb_ws.attestationtask.sendtoadmin
	*   current - cmdb_data_management_task record
	*   parm1 - list of cmdb data manager admins comma separated (email recipients)
	*   parm2 - assignment information object
	**/
	
	var taskId = current.sys_id;
	var assignmentInfo = event.parm2 ? JSON.parse(event.parm2) : null;

	if (taskId) {
		var currentUser = "";
		var assignmentGroup = "";

		if (assignmentInfo && Object.keys(assignmentInfo).length > 0) {
			if (assignmentInfo["currentUser"])
				currentUser = assignmentInfo["currentUser"];

			if (assignmentInfo["assignmentGroup"])
				assignmentGroup = assignmentInfo["assignmentGroup"];
		}

		var reviewGr = new GlideRecord('cmdb_data_management_task');
		reviewGr.get(taskId);
		
		var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/attestation-task/' + taskId + '">' + reviewGr.getValue('number') + '</a>';
		template.print(gs.getMessage('\'{0}\' has forwarded Attestation task {1} for reassignment. The task is related to policy \'{2}\' and ', [currentUser, url, reviewGr.policy_id.name]));
		
		if (assignmentGroup) {
			template.print(gs.getMessage('was originally assigned to the \'{0}\' group.', assignmentGroup));
		} else {
			template.print(gs.getMessage('there is no assignment group.'));
		}
		
		reviewGr.setValue('last_notification_time', new GlideDateTime());
		reviewGr.update();
	} else {
		gs.warn("CMDB attestation task send to admin email notification script did not receive any associated task.");
	}
})(current, template, email, email_action, event);
