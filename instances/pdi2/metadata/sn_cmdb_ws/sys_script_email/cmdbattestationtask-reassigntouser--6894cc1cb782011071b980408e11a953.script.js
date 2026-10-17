(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    /**
	*   event - sn_cmdb_ws.attestationtask.reassign
	*   current - cmdb_data_management_task record
	*   parm1 - new assignee (email recipient)
	*   parm2 - assignment information object
	**/
	
	var taskId = current.sys_id;
	var assignmentInfo = event.parm2 ? JSON.parse(event.parm2) : null;

	if (taskId) {
		var currentUser = "";
		var assignedUser = "";
		var assignmentGroup = "";
		var isCurrentUserDMAdmin = false;
		
		if (assignmentInfo && Object.keys(assignmentInfo).length > 0) {
			if (assignmentInfo["currentUser"])
				currentUser = assignmentInfo["currentUser"];
			
			if (assignmentInfo["assignedUser"])
				assignedUser = assignmentInfo["assignedUser"];

			if (assignmentInfo["assignmentGroup"])
				assignmentGroup = assignmentInfo["assignmentGroup"];
			
			if (assignmentInfo["isCurrentUserDMAdmin"])
				isCurrentUserDMAdmin = assignmentInfo["isCurrentUserDMAdmin"];
		}
		
		var reviewGr = new GlideRecord('cmdb_data_management_task');
		reviewGr.get(taskId);

		var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/attestation-task/' + taskId + '">' + reviewGr.getValue('number') + '</a>';
		template.print(gs.getMessage('Attestation task {0} has been assigned to you by ', url));
		
		if (isCurrentUserDMAdmin) {
			template.print(gs.getMessage('[admin: {0}].<br>', currentUser));
		} else {
			template.print(gs.getMessage('[previous assignee: {0}].<br>', assignedUser));
		}
		
		if (assignmentGroup) {
			template.print(gs.getMessage('If the task should not be assigned to you, use the task\'s Reassign action to assign it to another member of the \'{0}\' group or send the task for reassignment.', assignmentGroup));
		} else {
			template.print(gs.getMessage('If the task should not be assigned to you, use the task\'s Reassign action to send the task for reassignment.'));
		}
		
		reviewGr.setValue('last_notification_time', new GlideDateTime());
		reviewGr.update();
	} else {
		gs.warn("CMDB attestation task reassign to user email notification script did not receive any associated task.");
	}

})(current, template, email, email_action, event);
