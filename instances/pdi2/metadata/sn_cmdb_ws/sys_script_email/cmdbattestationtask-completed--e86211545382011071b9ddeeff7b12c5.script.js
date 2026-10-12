(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    /**
	*   event - sn_cmdb_ws.attestationtask.completed
	*   current - cmdb_data_management_task record
	*   parm1 - list of data manager admins comma separated (email recipients)
	*   parm2 - CI count summary object
	**/

	var taskId = current.sys_id;
	var cisSummaryObj = event.parm2 ? JSON.parse(event.parm2) : null;

	if (taskId) {
		var totalCICount = 0;
		var attestedCICount = 0;
		var rejectedCICount = 0;
		
		if (cisSummaryObj && Object.keys(cisSummaryObj).length > 0) {
			if (cisSummaryObj["totalCICount"])
				totalCICount = cisSummaryObj["totalCICount"];

			if (cisSummaryObj["attestedCICount"])
				attestedCICount = cisSummaryObj["attestedCICount"];

			if (cisSummaryObj["rejectedCICount"])
				rejectedCICount = cisSummaryObj["rejectedCICount"];
		}

		var reviewGr = new GlideRecord('cmdb_data_management_task');
		reviewGr.get(taskId);
		
		var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/attestation-task/' + taskId + '">' + reviewGr.getValue('number') + '</a>';
		template.print(gs.getMessage('Attestation task {0} was completed on \'{1}\' by \'{2}\'.<br><br>', [url, reviewGr.getDisplayValue('closed_at'), reviewGr.getDisplayValue('assigned_to')]));
		template.print(gs.getMessage('Total CIs: {0}<br>', totalCICount));
		template.print(gs.getMessage('Attested CIs: {0}<br>', attestedCICount));
		template.print(gs.getMessage('Rejected CIs: {0}<br>', rejectedCICount));

		reviewGr.setValue('last_notification_time', new GlideDateTime());
		reviewGr.update();
	} else {
		gs.warn("CMDB attestation task completed email notification script did not receive any associated task.");
	}

})(current, template, email, email_action, event);
