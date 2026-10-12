(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var message;
    if (current.getValue('sync_status') == 'completed') {
        message = gs.getMessage('Advanced portal navigation sync completed');
    } else if (current.getValue('sync_status') == 'last_sync_failed') {
        message = gs.getMessage('Advanced portal navigation sync failed')
    }
    email.setSubject(message);
    template.print(message);

})(current, template, email, email_action, event);
