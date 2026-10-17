(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var requestorName = current.getDisplayValue("requestor_name");
	var inviteeName = current.getDisplayValue("group_invitee_name") || current.getDisplayValue("invitee_name");
	var appName = current.getDisplayValue("app_name");
	var descriptorUpperCase = (current.getDisplayValue("collaboration_descriptor_name") || '').toLocaleUpperCase(gs.getSession().getLanguage());
	
	var collabRequestEmail = new CollabRequestEmailScript();
	
	collabRequestEmail.addHeading(gs.getMessage("Welcome to the team!"));
	collabRequestEmail.addText(gs.getMessage("Hi {0},", inviteeName), false); // greeting
	collabRequestEmail.addText(gs.getMessage("You have been added as a collaborator on the app, {0}. You have {1} privileges.", [appName, descriptorUpperCase]), true); // message
	collabRequestEmail.addButton(gs.getMessage("Go to your app"), current.getValue("app_url"));
	
	email.setSubject(gs.getMessage("You are now a collaborator"));
	template.print(collabRequestEmail.getBody());

})(current, template, email, email_action, event);
