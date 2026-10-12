(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template, /* Optional EmailOutbound */
    email) {	
	var appName = current.variables.application_name;
    var approvalEmail = new AppIntakeApprovalEmail();

    template.print(approvalEmail.getEmailMessageAdminManualPermissionProvisioning(current.opened_by.getRefRecord().getValue("name"), appName));

})(current, template, email);
