(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var creatorStudioEmail = new CreatorStudioEmailScript();
    creatorStudioEmail.addHeading(gs.getMessage("{0} was closed because it was rejected", current.getDisplayValue("number")), false);
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("requestor_name")), false);
    creatorStudioEmail.addText(gs.getMessage("The request you submitted has been rejected."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Submitted on"), current.getDisplayValue("opened_at"));
    creatorStudioEmail.addText(gs.getMessage("Contact your admin if you have any questions about why this request was rejected."), false);
    creatorStudioEmail.addFooter(gs.getMessage("You are receiving this email because you submitted a request."));
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
