(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var pipelineRunnerFailedEmail = new PipelineRunnerFailedEmail();

    // subject
    var subject = pipelineRunnerFailedEmail.getSubject();
    email.setSubject(subject);

    // email body
    var recipientGroups = email_action.recipient_groups || '';
    var body = pipelineRunnerFailedEmail.getFailedGenericEmailBody(recipientGroups, current);

    template.print(body);

})(current, template, email, email_action, event);
