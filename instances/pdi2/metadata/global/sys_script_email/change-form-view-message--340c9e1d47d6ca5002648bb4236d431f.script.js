(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    template.print(gs.getMessage("Click here to view change request: {0}", "${URI_REF}"));

})(current, template, email, email_action, event);
