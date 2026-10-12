(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    const creatorStudioEmail = new sn_creatorstudio.CreatorStudioEmailScript();
    const viewRequestMessage = gs.getMessage("View request");
    creatorStudioEmail.addHeading(gs.getMessage("You've been assigned a request"));
    creatorStudioEmail.addText(gs.getMessage("Hi {0},", current.getDisplayValue("assigned_to")), false);
    creatorStudioEmail.addText(gs.getMessage("You were recently assigned to a request."), false);
    creatorStudioEmail.addInfo(gs.getMessage("Request"), current.getDisplayValue("number"));
    creatorStudioEmail.addInfo(gs.getMessage("Submitted by"), current.getDisplayValue("opened_by"));
    creatorStudioEmail.addInfo(gs.getMessage("Form name"), current.getDisplayValue("request_type"));
    creatorStudioEmail.addInfo(gs.getMessage("App name"), creatorStudioEmail.getAppNameFromTable(current.getValue("sys_class_name")));
    creatorStudioEmail.addText(gs.getMessage("You can access this request from the list view in the Workspace or directly from this email."), false);
    creatorStudioEmail.addButton(viewRequestMessage, creatorStudioEmail.getWorkspaceUrl(current));
    creatorStudioEmail.addFooter(gs.getMessage("You are receiving this email to update you about submitted requests."));
    template.print(creatorStudioEmail.getBody());
})(current, template, email, email_action, event);
