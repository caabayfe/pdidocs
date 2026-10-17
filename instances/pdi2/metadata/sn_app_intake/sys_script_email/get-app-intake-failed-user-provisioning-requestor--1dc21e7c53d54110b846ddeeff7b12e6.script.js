(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var requestorName = current.opened_by.getRefRecord().getValue('first_name');
	var requestNumber = current.getValue('number');
	var linkToRequest = '<a style="color:inherit;" href="' + current.getLink() + '">' + requestNumber + '</a>';

	var gr_sys_user_group = new GlideRecord('sys_user_group');
	gr_sys_user_group.get(AppIntakeConstants.groups.APP_ENGINE_ADMINS);

	var adminEmail = gr_sys_user_group.getValue('email');
	var linkToAdminEmail = adminEmail ? gs.getMessage('<a style="color:inherit;" href="mailto:' + adminEmail + '">admin</a>') : 'admin';

	var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	requestEmail.addHeading(gs.getMessage("Automated User Provisioning Failed"));

	requestEmail.addText(gs.getMessage("Hi {0},", requestorName));

	requestEmail.addText(gs.getMessage("The app intake request {0} was not completed successfully due to an unknown error and manual intervention has been requested. Please contact your {1} if you have any further questions.", [linkToRequest, linkToAdminEmail]));

	template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
