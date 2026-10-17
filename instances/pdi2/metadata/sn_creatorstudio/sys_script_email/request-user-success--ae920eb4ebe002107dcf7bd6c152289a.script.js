(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var creatorStudioEmail = new CreatorStudioEmailScript();
    var redirectTorecordPath = false;
    creatorStudioEmail.addHeading(gs.getMessage("Now you can start building this app"));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("requestor_name")), false);
    creatorStudioEmail.addText(gs.getMessage("Your request to create a new app in Creator Studio has been approved."), false);
    creatorStudioEmail.addInfo(gs.getMessage("App name"), current.getDisplayValue("short_description"));
    creatorStudioEmail.addText(gs.getMessage("You can open the app from this email or the Creator Studio home page."), false);
    creatorStudioEmail.addButton(gs.getMessage("Open app"), creatorStudioEmail.getAppUrl(current));
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
