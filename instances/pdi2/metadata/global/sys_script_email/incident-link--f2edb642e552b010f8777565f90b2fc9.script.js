(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var inc = current.task_id ? current.task_id.getRefRecord() : current;
    if (!inc.isValidRecord()) return;

    var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
    var link = '/' + portalSuffix + '?id=ticket&table=incident&sys_id=' + inc.sys_id;
    var message = 'View incident';

    if (email_action.sys_name.toString() === 'Incident Survey') {
        link = event.parm2;
        message = 'Take the survey';
    } else if (email_action.sys_name.toString() === 'Comment left on incident')
        message = 'View incident';

    template.print('<br><a href="' + link + '">');
    template.print(message);
    template.print('</a></div>');

    if (email_action.sys_name.toString() === 'Incident closed') {
        template.print('<div style="padding-top:16px">');
        template.print(gs.getMessage('Need something else? '));
        template.print('<a style="color: #3c59e7;" href="/' + portalSuffix + '?id=sc_cat_item&sys_id=3f1dd0320a0a0b99000a53f7604a2ef9">');
        template.print(gs.getMessage('Make another incident'));
        template.print('</a></div>');
    }
})(current, template, email, email_action, event);
