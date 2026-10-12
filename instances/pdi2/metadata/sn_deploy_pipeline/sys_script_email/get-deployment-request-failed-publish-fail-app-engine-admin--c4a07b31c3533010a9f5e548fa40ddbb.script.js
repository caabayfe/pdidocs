(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var deploymentRequestFailedAppEngineAdminEmailUtil = new DeploymentRequestFailedAppEngineAdminEmailUtil();

    // subject
    var subject = deploymentRequestFailedAppEngineAdminEmailUtil.getSubject(current);
    email.setSubject(subject);

    var emailBody = deploymentRequestFailedAppEngineAdminEmailUtil.getPublishFailedEmailBodyForAppEngineAdmin(current);

    template.print(emailBody);
})(current, template, email, email_action, event);
