(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    const creatorStudioEmail = new CreatorStudioEmailScript();
    const viewTaskMessage = gs.getMessage("View task");
    creatorStudioEmail.addHeading(gs.getMessage("You’ll need to manually add the requester’s instance"));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("assignment_group")), false);
    creatorStudioEmail.addText(gs.getMessage("You recently received a request to create a new app in Creator Studio."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Person requesting app"), current.getDisplayValue("requestor_name"));
    creatorStudioEmail.addInfo(gs.getMessage("App name"), current.getDisplayValue("short_description"));
    creatorStudioEmail.addText(gs.getMessage("However, you don’t have access to the instance of the person who submitted the request. You’ll need to manually add their instance to the sn_pipeline_environment table to approve this request."), false);
    const aemcService = new AEMCService();
    if (aemcService.aemcInstalled()) {
        creatorStudioEmail.addButton(viewTaskMessage, aemcService.aemcTasksUrl(current));
    } else {
        creatorStudioEmail.addButton(viewTaskMessage, creatorStudioEmail.getTasksUrl(current));
    }
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
