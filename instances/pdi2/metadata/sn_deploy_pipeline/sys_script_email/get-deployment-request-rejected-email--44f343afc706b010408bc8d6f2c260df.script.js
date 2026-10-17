(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var firstName = current.getDisplayValue("requestor_first_name");
	var lastName = current.getDisplayValue("requestor_last_name");
	var requestorName = (firstName + " " + lastName).trim();
	var appName = current.getDisplayValue("app_name");
	var adminEmail = sn_app_eng_notify.AppEngineAdminGroup.getEmail();
	var comment = getRejectedComment();
	
	var deploymentRequestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	
	deploymentRequestEmail.addHeading(gs.getMessage("{0} app wasn't approved", appName));
	deploymentRequestEmail.addText(gs.getMessage("Hi {0},", requestorName), false); // greeting
	if (adminEmail) {
		deploymentRequestEmail.addText(gs.getMessage("Your App Engine Studio administrator didn't approve your submitted app and can't be published, yet. Email {0} to resolve any issues with your app.", adminEmail), true); // message
	} else {
		deploymentRequestEmail.addText(gs.getMessage("Your App Engine Studio administrator didn't approve your submitted app and can't be published, yet. Email your admin to resolve any issues with your app."), true); // message
	}
	
	if (comment) {
		deploymentRequestEmail.addText(gs.getMessage("Comment from admin:"));
		deploymentRequestEmail.addComment(comment);
	}
	
	email.setSubject(gs.getMessage("{0} app wasn't approved", appName));
	template.print(deploymentRequestEmail.getBody());
	
	function getRejectedComment() {
		var grApproval = new GlideRecord("sysapproval_approver");
		grApproval.addQuery("sysapproval", current.getUniqueValue());
		grApproval.addQuery("state", "rejected");
		grApproval.orderByDesc("updated");
		grApproval.setLimit(1);

		grApproval.query();

		if (grApproval.hasNext()) {
			grApproval.next();
			var grJournalField = new GlideRecord("sys_journal_field");
			grJournalField.addQuery("element_id", grApproval.getUniqueValue());
			grJournalField.orderByDesc("sys_created_on");
			grJournalField.setLimit(1);

			grJournalField.query();

			if (grJournalField.next()) {
				return grJournalField.getDisplayValue("value");
			}
			return '';
		}
		return '';
	}

})(current, template, email, email_action, event);
