(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {


    var data = event.getValue("parm2");
    var parsedData = JSON.parse(data);

    var userName = parsedData.user_full_name;
    var templateName = parsedData.template_name;

    var originInstanceUrl = parsedData.origin_instance_url;
    var partialPathToTemplatesHomPage = '/now/appenginestudio/templates';
    var templatesHomePageRef = originInstanceUrl + partialPathToTemplatesHomPage;

    var templatesResourceRef = originInstanceUrl + '/api/now/v1/context_doc_url/app_template_authoring';
    var referenceLinkStyle = 'color: #01778e;';
    var referenceOpen = '<a style="' + referenceLinkStyle + '" href="' + templatesResourceRef + '">';
    var referenceClose = '</a>';

    var message = gs.getMessage("The template \"{0}\" was recently shared with you. Now you can view the template in App Engine Studio and use it to build applications. {1}Learn more about app templates{2}", [templateName, referenceOpen, referenceClose]);

    var currentUserPayloadData = parsedData && parsedData.currentUserPayloadData;

    if (currentUserPayloadData && currentUserPayloadData.from_group_membership && currentUserPayloadData.group_name) {
        message = gs.getMessage("The template \"{0}\" was recently shared with the group \"{1}\". Now you can view the template in App Engine Studio and use it to build applications. {2}Learn more about app templates{3}", [templateName, currentUserPayloadData.group_name, referenceOpen, referenceClose]);
    }

    var constructedEmail = new sn_app_eng_notify.AppEngineEmailScript();

    constructedEmail.addHeading(gs.getMessage("Now you can access this template"));
    constructedEmail.addText(gs.getMessage("Hi {0},", userName), false); // greeting
    constructedEmail.addText(message, true); // message
    constructedEmail.addButton(gs.getMessage("View all app templates"), templatesHomePageRef); // button

    email.setSubject(gs.getMessage("An app template was shared with you"));
    template.print(constructedEmail.getBody());

})(current, template, email, email_action, event);
