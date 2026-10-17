(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var syncStatus = current.getValue('sync_status');

    if (syncStatus === 'completed') {
        var count = JSON.parse(event.parm1).count;
        template.print(
            count === 0 ?
            gs.getMessage('Everything is up to date, no new changes detected.') :
            (count > 1 ?
                gs.getMessage('{0} new items added.', count) :
                gs.getMessage('{0} new item added.', count))
        );
    } else if (syncStatus === 'last_sync_failed') {
        template.print(gs.getMessage('There was a problem syncing the menu items. Please try again.'));
        template.print('<br>');
        template.print('<br>');
        template.print(gs.getMessage('If you are facing this issue repeatedly, try reaching out to your system administrator.'));
    }

})(current, template, email, email_action, event);
