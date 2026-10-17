(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var creatorStudioEmail = new CreatorStudioEmailScript();
    var redirectTorecordPath = true;
    creatorStudioEmail.addHeading(gs.getMessage("{0} was closed", current.getDisplayValue("number")));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("assignment_group")), false);
    creatorStudioEmail.addText(gs.getMessage("This request to create a new app in Creator Studio has been approved."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Person requesting app"), current.getDisplayValue("requestor_name"));
    creatorStudioEmail.addInfo(gs.getMessage("App name"), current.getDisplayValue("short_description"));
    creatorStudioEmail.addText(gs.getMessage("It has been closed and this person can now start building their app."), false);
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
