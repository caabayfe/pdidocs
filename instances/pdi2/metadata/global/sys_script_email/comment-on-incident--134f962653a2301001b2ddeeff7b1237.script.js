(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var commentorName = event.parm1;
    var userGr = new GlideRecord('sys_user');
    userGr.addQuery('sys_id', commentorName);
    userGr.query();
    if (userGr.next())
        commentorName = userGr.name;
    template.print('<div style="line-height: 24px;color:#181A1F;">');
    template.print('<div style="text-align: center; line-height:36px; padding-bottom: 24px;' +
        ' border-bottom: 1px solid #DADDE2;"><span style="font-size: 24px; font-weight:600">' +
        commentorName + ' added a comment to your incident</span></div>');
    template.print('<div style="font-size: 16px; padding-top: 24px; padding-bottom: 16px;">' +
        '<span style="font-weight: 400;">Hello </span> <span style="font-weight: 600;">' + current.caller_id.first_name + ',</span></div>');
    template.print('<div style="font-size: 16px; padding-bottom: 16px; "><span style="font-weight: 700;">' +
        commentorName + '</span><span style="font-weight: 400;"> left a comment on </span>' +
        '<span style="font-weight: 700">' + current.task_effective_number + ':</span></div>');
    template.print('<div style="font-size: 16px; font-weight: 600;">${comments:1}</div>');
    template.print('</div>');

})(current, template, email, email_action, event);
