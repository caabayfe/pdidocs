(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var parm1 = JSON.parse(event.parm1);
    var urlSuffix = parm1.urlSuffix;
    var publicURL = new PasswordResetUtil().getInstanceURL();
    var flow = 'change/reset';

    if (parm1.isChangeEnabled) {
        publicURL += '/$pwd_change.do';
        flow = 'change';
    } else if (parm1.isResetEnabled && parm1.isPublic) {
        publicURL += '/$pwd_reset.do?sysparm_url=' + urlSuffix;
        flow = 'reset';
    }

    template.print('<p>Please ' + flow + ' your password prior to expiration to avoid issues logging in.</p>');
    var hyperLinkElement = '<a href="' + publicURL + '">Click here to ' + flow + ' your password.</a>';
    template.print(hyperLinkElement);

})(current, template, email, email_action, event);
