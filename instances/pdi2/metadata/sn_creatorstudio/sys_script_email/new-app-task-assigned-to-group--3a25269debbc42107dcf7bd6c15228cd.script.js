(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    const creatorStudioEmail = new CreatorStudioEmailScript();
    const viewRequestMessage = gs.getMessage("View request");
    creatorStudioEmail.addHeading(gs.getMessage("The request is pending your approval"));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("assignment_group")), false);
    creatorStudioEmail.addText(gs.getMessage("You’ve received a request to create a new app in Creator Studio."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Person requesting app"), current.getDisplayValue("requestor_name"));
    creatorStudioEmail.addInfo(gs.getMessage("App name"), current.getDisplayValue("short_description"));
    creatorStudioEmail.addText(gs.getMessage("View the request to either approve or deny it."), false);
    const aemcService = new AEMCService();
    if (aemcService.aemcInstalled()) {
        creatorStudioEmail.addButton(viewRequestMessage, aemcService.aemcRequestUrl(current));
    } else {
        creatorStudioEmail.addButton(viewRequestMessage, creatorStudioEmail.getRequestUrl(current));
    }
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
