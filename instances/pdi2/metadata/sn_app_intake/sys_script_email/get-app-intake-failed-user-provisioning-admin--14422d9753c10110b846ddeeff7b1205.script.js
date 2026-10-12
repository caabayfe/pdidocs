(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var requestorName = current.opened_by.getRefRecord().getValue('name');
	var requestNumber = current.request.getRefRecord().getValue('number');
	var linkToRequest = '<a style="color:inherit;" href="' + current.request.getRefRecord().getLink() + '">' + requestNumber + '</a>';

	var developmentInstanceSysID = current.variables.development_instance;


	var gr_pipeline_environment = new GlideRecord(AppIntakeConstants.table.SN_PIPELINE_ENVIRONMENT);
	gr_pipeline_environment.get(developmentInstanceSysID);
	var devEnvURL = gr_pipeline_environment.getValue('instance_url');
	var devEnvName = gr_pipeline_environment.getValue('name');
	var linkToDevInstance = '<a style="color:inherit;" href="' + devEnvURL + '">' + devEnvName + '</a>';

	var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();
	requestEmail.addHeading(gs.getMessage("Automated User Provisioning Failed"));

	requestEmail.addText(gs.getMessage("Hi App Engine Admins,"));

	requestEmail.addText(gs.getMessage('User provisioning failed for request, {0}. The requestor, {1}, will need to be manually provisioned to {2}.', [linkToRequest, requestorName, linkToDevInstance]));

	template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
