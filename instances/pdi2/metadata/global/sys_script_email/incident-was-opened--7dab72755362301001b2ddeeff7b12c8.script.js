(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    template.print('<br>');
    if (current.caller_id.toString() !== current.opened_by.toString())
        template.print('<div>Opened by: ' + '<span style="font-weight:600">' +
            current.opened_by.name + '</span></div>');

})(current, template, email, email_action, event);
