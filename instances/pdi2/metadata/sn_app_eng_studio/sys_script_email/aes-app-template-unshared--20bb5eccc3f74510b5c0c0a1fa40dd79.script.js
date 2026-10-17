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

    var constructedEmail = new sn_app_eng_notify.AppEngineEmailScript();

    constructedEmail.addHeading(gs.getMessage("Your access rights have been removed"));
    constructedEmail.addText(gs.getMessage("Hi {0},", userName), false); // greeting
	
    if (!fromGroup) {
      constructedEmail.addText(gs.getMessage("You previously had access to the template \"{0}\". However, you won't be able to access it again because it's no longer shared with you.", templateName), true); // message
    } else {
		var groupName = parsedData.currentUserPayloadData.group_name;
		
      constructedEmail.addText(gs.getMessage("You previously had access to the template \"{0}\". However, you won't be able to access it again because it's no longer shared with the group \"{1}\".", [templateName, groupName]), true); // message
    }
    
	constructedEmail.addText(gs.getMessage("If you need to access this template, contact your admin and ask them to share it with you again.")); // message

    email.setSubject(gs.getMessage("You no longer have access to an app template"));
    template.print(constructedEmail.getBody());
})(current, template, email, email_action, event);
