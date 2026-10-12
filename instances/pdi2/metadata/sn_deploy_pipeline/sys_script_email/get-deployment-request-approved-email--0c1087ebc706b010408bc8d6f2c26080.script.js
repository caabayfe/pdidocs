(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var firstName = current.getDisplayValue("requestor_first_name");
	var lastName = current.getDisplayValue("requestor_last_name");
	var requestorName = (firstName + " " + lastName).trim();
	var appName = current.getDisplayValue("app_name");
	var adminEmail = sn_app_eng_notify.AppEngineAdminGroup.getEmail();
	
	var deploymentRequestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	
	deploymentRequestEmail.addHeading(gs.getMessage("{0} app has been approved!", appName));
	deploymentRequestEmail.addText(gs.getMessage("Congrats, {0}", requestorName), false); // greeting
	if (adminEmail) {
		deploymentRequestEmail.addText(gs.getMessage("Your app has been approved and published. Email {0} with any questions on accessing your app.", adminEmail), false); // message
	} else {
		deploymentRequestEmail.addText(gs.getMessage("Your app has been approved and published. Email your admin with any questions on accessing your app."), false); // message
	}
	
	email.setSubject(gs.getMessage("{0} app has been approved", appName));
	template.print(deploymentRequestEmail.getBody());

})(current, template, email, email_action, event);
