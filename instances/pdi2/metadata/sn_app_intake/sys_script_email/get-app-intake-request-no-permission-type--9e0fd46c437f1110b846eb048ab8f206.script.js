(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var requestorName = current.requested_for.getRefRecord().getValue('name');
    var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();

    requestEmail.addHeading(gs.getMessage("A user wants to create an app"));

    requestEmail.addText(gs.getMessage("Hi App Engine Admins,"));

    requestEmail.addText(gs.getMessage("{0} wants to create an app. You'll need to select the development instance for them and determine their permission type once you review their request.", [requestorName]));

	requestEmail.addText(gs.getMessage('Once you set the permission type, close the Catalog Task so that you can approve or reject the request.'));

    requestEmail.addButton(gs.getMessage("Review request"), current.request.getRefRecord().getLink());

    template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
