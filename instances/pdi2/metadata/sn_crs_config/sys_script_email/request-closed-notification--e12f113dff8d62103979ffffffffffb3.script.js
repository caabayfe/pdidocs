(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    const creatorStudioEmail = new sn_creatorstudio.CreatorStudioEmailScript();
    const viewRequestMessage = gs.getMessage("View request");
    creatorStudioEmail.addHeading(gs.getMessage("{0} was closed", current.getDisplayValue("number")));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("opened_by")), false);

    creatorStudioEmail.addText(gs.getMessage("The request you submitted has been closed."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Submitted on"), current.getDisplayValue("sys_created_on"));
    creatorStudioEmail.addButton(viewRequestMessage, creatorStudioEmail.getSubmittedRequestUrl(current));
    creatorStudioEmail.addFooter(gs.getMessage("You are receiving this email because you submitted a request."));
    template.print(creatorStudioEmail.getBody());

})(current, template, email, email_action, event);
