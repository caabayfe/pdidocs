(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template, /* Optional EmailOutbound */
    email) {
    var appName = current.variables.application_name;
    var developmentInstanceSysID = current.variables.development_instance;

    var gr_pipeline_environment = new GlideRecord("sn_pipeline_environment");
    gr_pipeline_environment.get(developmentInstanceSysID);
    var devEnvURL = gr_pipeline_environment.getValue('instance_url');

    var approvalEmail = new AppIntakeApprovalEmail();
    email.setSubject(approvalEmail.getEmailSubject());
    template.print(approvalEmail.getApprovedEmailMessage(current.opened_by.getRefRecord().getValue("name"), appName, devEnvURL));

})(current, template, email);
