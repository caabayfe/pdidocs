(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var requestorName = current.getDisplayValue("requestor_name");
	var inviteeName = current.getDisplayValue("group_invitee_name") || current.getDisplayValue("invitee_name");
	var appName = current.getDisplayValue("app_name");
	var descriptorUpperCase = (current.getDisplayValue("collaboration_descriptor_name") || '').toLocaleUpperCase(gs.getSession().getLanguage());
	
	var collabRequestEmail = new CollabRequestEmailScript();
	
	collabRequestEmail.addHeading(gs.getMessage("The team just got bigger!"));
	collabRequestEmail.addText(gs.getMessage("Hi {0},", requestorName), false); // greeting
	collabRequestEmail.addText(gs.getMessage("Good news! {0} has been added to the app, {1}, as {2}. You can now start working with them.", [inviteeName, appName, descriptorUpperCase]), true); // message
	collabRequestEmail.addButton(gs.getMessage("Go to your app"), current.getValue("app_url"));
	
	email.setSubject(gs.getMessage("Your collaborator request was approved"));
	template.print(collabRequestEmail.getBody());

})(current, template, email, email_action, event);
