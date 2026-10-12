(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var deploymentRequestFailedRequestorEmailUtil = new DeploymentRequestFailedRequestorEmailUtil();

    // subject
    var subject = deploymentRequestFailedRequestorEmailUtil.getSubject(current);
    email.setSubject(subject);

    var emailBody = deploymentRequestFailedRequestorEmailUtil.getPublishFailedEmailBodyForRequestor(current);

    template.print(emailBody);
})(current, template, email, email_action, event);
