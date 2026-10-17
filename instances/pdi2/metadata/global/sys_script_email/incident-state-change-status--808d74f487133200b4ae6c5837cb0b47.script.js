(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    template.print('<div style="font-size: 16px;" ><span style="font-weight: 400;">The state for </span>');
    template.print('<span style="font-weight: 700; color: #181A1F;">${number} </span>');
    template.print('<span style="font-weight: 400; ">has changed to ' + current.state.getDisplayValue() + '.</span></div>');
})(current, template, email, email_action, event);
