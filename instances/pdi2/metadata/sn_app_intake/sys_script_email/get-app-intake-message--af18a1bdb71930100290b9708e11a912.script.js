(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template, /* Optional EmailOutbound */
    email) {
	var appName = current.variables.application_name;
	var developmentInstanceSysID = current.variables.development_instance;
	var permissionType = current.variables.permission_type ? current.variables.permission_type.toString() : AppIntakeConstants.permissionTypes.FULL;

	var gr_pipeline_environment = new GlideRecord("sn_pipeline_environment");
	gr_pipeline_environment.get(developmentInstanceSysID);
	var devEnvURL = gr_pipeline_environment.getValue('instance_url');

    var approvalEmail = new AppIntakeApprovalEmail();
    email.setSubject(approvalEmail.getEmailSubject());
	if ( permissionType === AppIntakeConstants.permissionTypes.FULL ) {
		template.print(approvalEmail.getEmailMessage(current.opened_by.getRefRecord().getValue("name"), appName, devEnvURL));
	} else if ( permissionType === AppIntakeConstants.permissionTypes.LIMITED ) {
		template.print(approvalEmail.getEmailMessageLimited(current.opened_by.getRefRecord().getValue("name"), appName));
	}

})(current, template, email);
