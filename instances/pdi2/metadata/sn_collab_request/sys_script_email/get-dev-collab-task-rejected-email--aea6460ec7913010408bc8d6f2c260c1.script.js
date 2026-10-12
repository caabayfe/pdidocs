(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var requestorName = current.getDisplayValue("requestor_name");
	var inviteeName = current.getDisplayValue("group_invitee_name") || current.getDisplayValue("invitee_name");
	var appName = current.getDisplayValue("app_name");
	var comment = getRejectedComment();
	
	var collabRequestEmail = new CollabRequestEmailScript();
	
	collabRequestEmail.addHeading(gs.getMessage("The collaborator you requested wasn't approved"));
	collabRequestEmail.addText(gs.getMessage("Hi {0},", requestorName), false); // greeting
	collabRequestEmail.addText(gs.getMessage("Your admin didn't approve adding {0} as a collaborator to the app, {1}.", [inviteeName, appName]), true); // message
	
	if (comment) {
		collabRequestEmail.addText(gs.getMessage("Comment from admin:"));
		collabRequestEmail.addComment(comment);
	}
	
	collabRequestEmail.addText(gs.getMessage("For additional information, contact your admin."));
	
	email.setSubject(gs.getMessage("Your collaborator request wasn't approved"));
	template.print(collabRequestEmail.getBody());
	
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
