(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var appName = current.getDisplayValue("app_name");
    var inviteeName = current.getDisplayValue("group_invitee_name") || current.getDisplayValue("invitee_name");
    var env = current.originating_environment.getRefRecord();
    var collabRequestEmail = new CollabRequestEmailScript();
    collabRequestEmail.addHeading(gs.getMessage("A collaborator request has failed"));
    collabRequestEmail.addText(gs.getMessage("Hi, App Engine Admin"));
    if (env.sys_id) {
        var envName = env.getDisplayValue('name');
        collabRequestEmail.addText(gs.getMessage("The request failed for adding {0} as a collaborator to the app on {1}, {2}.", [inviteeName, envName, appName]), true);
    } else {
        collabRequestEmail.addText(gs.getMessage("The request failed for adding {0} as a collaborator to the app, {1}.", [inviteeName, appName]), true);
    }

    collabRequestEmail.addText(gs.getMessage("For additional information, contact your admin."));

    email.setSubject(gs.getMessage("Your collaborator request failed"));
    template.print(collabRequestEmail.getBody());

})(current, template, email, email_action, event);
