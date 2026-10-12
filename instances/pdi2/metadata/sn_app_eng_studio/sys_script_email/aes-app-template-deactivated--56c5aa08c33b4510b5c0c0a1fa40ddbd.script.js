(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {


    var data = event.getValue("parm2");
    var parsedData = JSON.parse(data);

    var userName = parsedData.user_full_name;
    var templateName = parsedData.template_name;
    var fromGroup = parsedData.currentUserPayloadData && parsedData.currentUserPayloadData.from_group_membership;


    var originInstanceUrl = parsedData.origin_instance_url;
    var partialPathToTemplatesHomPage = '/now/appenginestudio/templates';
    var link = originInstanceUrl + partialPathToTemplatesHomPage;

    var constructedEmail = new sn_app_eng_notify.AppEngineEmailScript();

    constructedEmail.addHeading(gs.getMessage("You can no longer view or use this template"));
    constructedEmail.addText(gs.getMessage("Hi {0},", userName), false); // greeting
    if (!fromGroup) {
        constructedEmail.addText(gs.getMessage("You previously had access to the template \"{0}\" because it was shared with you. However, you can no longer view it or use it because it has been deactivated or deleted.", templateName), true);
    } else {
        var groupName = parsedData.currentUserPayloadData.group_name;
        constructedEmail.addText(gs.getMessage("You previously had access to the template \"{0}\" because it was shared with the group \"{1}\"  that you are a part of. However, you can no longer view it or use it because it has been deactivated or deleted.", [templateName, groupName]), true); // message
    }

    constructedEmail.addText(gs.getMessage("If you want to access this template again, contact your admin and ask them to activate it or restore it.")); // message

    constructedEmail.addButton(gs.getMessage("View all app templates"), link); // button

    email.setSubject(gs.getMessage("The template has been deactivated or deleted"));
    template.print(constructedEmail.getBody());
})(current, template, email, email_action, event);
