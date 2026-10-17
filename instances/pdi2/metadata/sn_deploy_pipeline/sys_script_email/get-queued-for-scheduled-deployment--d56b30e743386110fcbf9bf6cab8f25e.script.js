(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var firstName = current.deployment_request.getRefRecord().getDisplayValue("requestor_first_name");
	var lastName = current.deployment_request.getRefRecord().getDisplayValue("requestor_last_name");
	var requestorName = (firstName + " " + lastName).trim();
	var appName = current.deployment_request.getRefRecord().getDisplayValue("app_name");
	var scheduledDateTime = current.getDisplayValue("scheduled_deployment_date");
	
	var deploymentRequestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	
	deploymentRequestEmail.addHeading(gs.getMessage("{0} app has been approved!", appName));
	deploymentRequestEmail.addText(gs.getMessage("Congrats, {0}", requestorName), false); // greeting
	deploymentRequestEmail.addText(gs.getMessage("Your app has been approved and scheduled for deployment on {0}.", scheduledDateTime), false); // message
	
	email.setSubject(gs.getMessage("{0} app is scheduled for deployment", appName));
	template.print(deploymentRequestEmail.getBody());

})(current, template, email, email_action, event);
