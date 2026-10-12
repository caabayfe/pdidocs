(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    if (current.task_id.nil())
        return;

    var req = current.task_id.getRefRecord();
    if (!req.isValidRecord())
        return;

    var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
    var viewAllUrl = '/' + portalSuffix + '?id=order_status&table=sc_request&sys_id=' + req.sys_id;
    var requestUrl = '';
    var buttonText = '';
    if (email_action.sys_name.toString() === 'Request survey') {
        requestUrl = event.parm2;
        buttonText = sn_i18n.Message.getMessage('global', 'Take the survey');
    } else {
        requestUrl = viewAllUrl;
        buttonText = sn_i18n.Message.getMessage('global', 'View request');
    }

    //Generates primary action of view request
    var requestNotificationJs = new global.RequestNotificationUtil();
    requestNotificationJs.createNotificationPrimayAction(template, requestUrl, buttonText);
    if (email_action.sys_name.toString() === 'Request survey') {
        template.print('<div style="font-size: 15pt; line-height: 30px; padding-bottom: 16px;"><span style="font-weight:600">About your recent request</span></div>');

    } else {
        template.print('<div style="font-size: 15pt; line-height: 30px; padding-bottom: 16px;"><span style="font-weight:600">About this request</span></div>');
    }

    //request details required for notification template
    var requestDetails = requestNotificationJs.getRequestDetails(req.sys_id, req);
    var requestItemPadding = '';
    if (email_action.sys_name.toString() === 'Request completed' && !req.close_notes.nil()) {
        var comments = req.close_notes.toString();
        comments = comments.replace(/\n/g, '<br/>');
        template.print('<div> Completed by : ' + '<b style="font-weight:600">' + req.closed_by.name + '</b></div>');
        template.print('<div> Completion notes : ' + '<b style="font-weight:600">' + comments + '</b></div>');
        requestItemPadding = 'padding-top:16px;';
    }

    if (email_action.sys_name.toString() === 'Request approved') {
        var comment = requestNotificationJs.getRequestComment(req.sys_id, 'approved');
        if (comment) {
            template.print('<div> Approval notes : ' + '<b style="font-weight:600">' + comment + '</b></div>');
            requestItemPadding = 'padding-top:16px;';
        }
    }
    if (requestDetails.totalTasks > 1) {
        template.print('<div style="font-size: 12pt;font-weight:600;' + requestItemPadding + '">Requested items (' + requestDetails.totalTasks + ')</div>');
        requestItemPadding = 'padding-top:16px;';
    }
    requestDetails.tasks.forEach(function(task, index) {
        var borderBottom = 'border-bottom:1px solid #DADDE2';
        template.print('<div style="padding-bottom:16px;' + requestItemPadding);
        if (requestDetails.totalTasks > requestDetails.tasks.length || (index + 1 < requestDetails.tasks.length)) {
            template.print(borderBottom);
        }
        template.print('">');
        template.print('Requested item number: <b style="font-weight:600">' + task.requestNumber + '</b><br/>' + 'Short description: <b style="font-weight:600">' + task.item + '</b><br/>');
        template.print('</div>');
    });

    if (requestDetails.totalTasks > 3) {
        template.print('<div style="padding-bottom:18px;padding-top:16px;color:#3C59E7"><a href="' + viewAllUrl + '">');
        template.print(sn_i18n.Message.getMessage('global', 'View all items'));
        template.print('</a></div>');
    }
})(current, template, email, email_action, event);
