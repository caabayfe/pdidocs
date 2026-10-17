(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var message;
    if (current.getValue('sync_status') == 'completed') {
        message = gs.getMessage('The sync hierarchy action in advanced portal navigation has completed.');
    } else if (current.getValue('sync_status') == 'last_sync_failed') {
        message = gs.getMessage('The sync hierarchy action in advanced portal navigation has failed.');
    }
    template.print(message);

})(current, template, email, email_action, event);
