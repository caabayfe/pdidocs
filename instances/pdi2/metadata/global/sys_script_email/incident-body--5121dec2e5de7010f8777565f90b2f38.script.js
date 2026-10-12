(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    template.print('<div style="font-size: 16px;color:#181A1F;margin-top:24px;">');
    template.print('<div style="padding-bottom:16px;"><span style="font-weight: 400;">Hello </span><span style="font-size: 16px; font-weight: 600; line-height: 24px;">' + current.caller_id.first_name + ',</span></div>');
    template.print('<div style="padding-bottom:16px;"><span style="font-weight: 700;">' + current.number + '</span><span style="font-weight: 400;"> was resolved.</span></div>');
    var days = parseInt(gs.getProperty("glide.ui.autoclose.time"));
    template.print('<div>Hopefully you have everything you need. If not, you can ${mailto:mailto.reopen_request} Otherwise, your incident will be automatically closed');
    var hours = days * 24;
    if (days > 0) {
        if (days <= 3) {
            if (hours == 1)
                template.print(gs.getMessage(' after 1 hour'));
            else
                template.print(gs.getMessage(' after {0} hours', hours));
        } else
            template.print(gs.getMessage(' after {0} days', days));
    }

    template.print('.</div></div>');

})(current, template, email, email_action, event);
