(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    const creatorStudioEmail = new CreatorStudioEmailScript();
    const viewTaskMessage = gs.getMessage("View task");
    const redirectTorecordPath = true;
    creatorStudioEmail.addHeading(gs.getMessage("The app you approved wasn’t created"));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("assignment_group")), false);
    creatorStudioEmail.addText(gs.getMessage("You recently approved a request to create a new app in Creator Studio."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Person requesting app"), current.getDisplayValue("requestor_name"));
    creatorStudioEmail.addInfo(gs.getMessage("App name"), current.getDisplayValue("short_description"));
    creatorStudioEmail.addText(gs.getMessage("However, after you approved the request an error occurred that prevented it from being created. Check the app scope before trying again."), false);
    const aemcService = new AEMCService();
    if (aemcService.aemcInstalled()) {
        creatorStudioEmail.addButton(viewTaskMessage, aemcService.aemcRequestUrl(current));
    } else {
        creatorStudioEmail.addButton(viewTaskMessage, creatorStudioEmail.getTasksUrl(current));
    }
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
