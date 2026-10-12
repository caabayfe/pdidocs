(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var firstName = current.getDisplayValue("requestor_first_name");
	var lastName = current.getDisplayValue("requestor_last_name");
	var requestorName = (firstName + " " + lastName).trim();
	var appName = current.getDisplayValue("app_name");
	
	var deploymentRequestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	
	deploymentRequestEmail.addHeading(gs.getMessage("Your admin is reviewing {0} app", appName));
	deploymentRequestEmail.addText(gs.getMessage("Hi {0},", requestorName), false); // greeting
	deploymentRequestEmail.addText(gs.getMessage("Your administrator is currently reviewing and testing your application. Once it's approved, your admin will publish your app and you will be notified of its approval. You do not need to do anything at this time."), false); // message
	deploymentRequestEmail.addText(gs.getMessage("If you have questions on the status of your app, contact your administrator."), false);
	
	email.setSubject(gs.getMessage("{0} is being reviewed by your admin", appName));
	template.print(deploymentRequestEmail.getBody());

})(current, template, email, email_action, event);
