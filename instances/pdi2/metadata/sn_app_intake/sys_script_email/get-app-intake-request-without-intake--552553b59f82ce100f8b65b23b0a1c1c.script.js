(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var requestorName = current.requested_for.getRefRecord().getValue('name');
    var developmentInstanceName = gs.getMessage("N/A");
    var developmentInstanceLink = developmentInstanceName;
    var developmentInstanceID = current.variables.development_instance;

    if (developmentInstanceID) {
        var gr_pipeline_environment = new GlideRecord("sn_pipeline_environment");
        if (gr_pipeline_environment.get(developmentInstanceID)) {
            developmentInstanceName = gr_pipeline_environment.getDisplayValue('name');
            developmentInstanceLink = '<a style="color:inherit;" href="' + gr_pipeline_environment.getValue('instance_url') + '">' + developmentInstanceName + '</a>';
        }
    }

    var requestEmail = new sn_app_eng_notify.AppEngineEmailScript();
    requestEmail.addHeading(gs.getMessage("A user wants to create an app"));

    requestEmail.addText(gs.getMessage("Hi App Engine Admins,"));

    requestEmail.addText(gs.getMessage("{0} wants to create an app. However, the development instance automatically assigned to them doesn't have the latest Application Intake plugin installed.", requestorName));
    requestEmail.addText(gs.getMessage("Before you approve their request, install the latest Application Intake plugin on {0}. You can also select a different instance that has the Application Intake plugin installed already. Just make sure that the user has access to it before assigning the instance on the request item form.", [developmentInstanceLink, requestorName]));

    requestEmail.addButton(gs.getMessage("Review request"), current.request.getRefRecord().getLink());

    template.print(requestEmail.getBody());

})(current, template, email, email_action, event);
