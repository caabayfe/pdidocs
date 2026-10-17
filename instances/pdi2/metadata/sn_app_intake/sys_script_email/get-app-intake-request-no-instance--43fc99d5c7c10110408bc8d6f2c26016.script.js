(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var requestorName = current.requested_for.getRefRecord().getValue('name');
    var secondaryLinkURL = "/sn_pipeline_environment.do?sys_id=-1";
    var secondaryLinkText = gs.getMessage("Click here to create a development instance record");
    var secondaryLink = '<a style="color:inherit;" href="' + secondaryLinkURL + '">' + secondaryLinkText + '</a>';

    var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();
    requestEmail.addHeading(gs.getMessage("A user wants to create an app"));

    requestEmail.addText(gs.getMessage("Hi App Engine Admins,"));

    requestEmail.addText(gs.getMessage("{0} has submitted a request to create an app. However, an instance couldn't be automatically assigned to them because there are no development instances available.", requestorName));
    requestEmail.addText(gs.getMessage("Before you approve this request, create a development instance record for an environment that this user has access to and that has the latest Application Intake Plugin on it. Then, assign it to the user in the request item form. {0}", [secondaryLink]));

    requestEmail.addButton(gs.getMessage("Review request"), current.getLink());

    template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
