(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var requestorName = current.requested_for.getRefRecord().getValue('name');
    var developmentInstanceID = current.variables.development_instance;
    var developmentInstanceName = gs.getMessage("N/A");

    var gr_pipeline_environment = new GlideRecord("sn_pipeline_environment");
    if (gr_pipeline_environment.get(developmentInstanceID)) {
        developmentInstanceName = gr_pipeline_environment.getDisplayValue('name');
    }

    var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();
    requestEmail.addHeading(gs.getMessage("A user wants to create an app"));

    requestEmail.addText(gs.getMessage("Hi App Engine Admins,"));

    requestEmail.addText(gs.getMessage("{0} wants to create an app.", requestorName));
    requestEmail.addText(gs.getMessage("Once you approve their request, they will have access to the development instance: {0}. At that time, you can also determine which app development tools in App Engine they will have access to.", developmentInstanceName));

    requestEmail.addButton(gs.getMessage("Review request"), current.request.getRefRecord().getLink());

    template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
