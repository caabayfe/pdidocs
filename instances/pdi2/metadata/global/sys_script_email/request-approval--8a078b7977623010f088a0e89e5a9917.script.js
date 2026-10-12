(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var request = current.sysapproval;
    var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
    var requestUrl = '/' + portalSuffix + '?id=order_status&table=sc_request&sys_id=' + request;
    var approvalRecUrl = '/' + portalSuffix + '?id=hrm_todo&sysparm_tableName=sysapproval_approver&sys_id=' + current.sys_id;
    var colorTheme = 'color: #4F52BD;';
    var fontSize = 'font-size: 16px;';
    var lineHeight = 'line-height: 24px;';
    var fontFamily = 'font-family: Lato, Arial, sans-serif;';
    var display = 'display: inline-block;';
    template.print('<div style="padding-bottom:32px"> <span style="margin-right: 4px;">View</span> <a href="' + approvalRecUrl + '"');
    template.print('style="' + colorTheme + fontSize + fontFamily + display);
    template.print('">');
    template.print(gs.getMessage('approval request'));
    template.print('</a></div>');

    var notificationUtil = new RequestNotificationUtil();
    var requestDetails = notificationUtil.getRequestDetails(request, request, true);
    var showRequestedFor = requestDetails.showRequestedFor;
    var tasks = requestDetails.tasks;
    var totalTasks = requestDetails.totalTasks;


    template.print('<div style="font-size: 15pt; line-height:30px; padding-bottom:16px"><b>About this request</b></div>');

    var priceDisplay = gs.getProperty('glide.sc.price.display');
    var showRequestPrice = false;
    if (requestDetails.totalTasks > 1 && priceDisplay !== 'never' && request.price > 0) {
        showRequestPrice = true;
    }
    var showOpenedBy = false;

    if (request.opened_by.toString() !== request.requested_for.toString()) {
        showOpenedBy = true;
    }
    var requestItemsPadding = 'padding-top:16px;';
    if (showOpenedBy || showRequestedFor || showRequestPrice) {
        template.print('<div style="padding-bottom:16px">');

        if (showRequestedFor) {
            template.print('<div style="' + fontSize + lineHeight + '">Requested for: ' + '<b>' + request.requested_for.name + '</b></div>');
        }
        if (showOpenedBy) {
            template.print('<div style="' + fontSize + lineHeight + '">Opened by: ' + '<b>' + request.opened_by.name + '</b></div>');
        }
        if (showRequestPrice) {
            var recurringPriceText = notificationUtil.gerRecurringPriceRollup(request);
            template.print('<div style="' + fontSize + lineHeight + '">Total price: ' + '<b>' + request.price.getDisplayValue() + '</b><span style="font-size:14px;font-weight: 600">' + recurringPriceText + '</span></div>');
        }
        template.print('</div>');
    } else {
        requestItemsPadding = '';
    }

    if (requestDetails.totalTasks > 1) {
        template.print('<div style="font-size: 12pt;font-weight:600;' + requestItemsPadding + '">Requested items (' + requestDetails.totalTasks + ')</div>');
    }
    tasks.forEach(function(task, index) {
        var borderBottom = 'border-bottom:1px solid #DADDE2';
        if (requestDetails.totalTasks > 1) {
            template.print('<div style="padding-top:16px;padding-bottom:16px;');
        } else {
            template.print('<div style="padding-bottom:16px;');
        }
        if (requestDetails.totalTasks > requestDetails.tasks.length || (index + 1 < requestDetails.tasks.length)) {
            template.print(borderBottom);
        }
        template.print('">');
        template.print('<div style="' + fontSize + lineHeight + '">Requested item number: <b>' + task.requestNumber + '</b></div>');
        template.print('<div style="' + fontSize + lineHeight + '">Short description: <b>' + task.item + '</b></div>');
        if (task.variables.length > 0) {
            notificationUtil.setRequestItemVariablestoTemplate(task, template);
        }
        if (!showRequestedFor) {
            template.print('<div style="' + fontSize + lineHeight + '">Requested for: <b style="font-weight:600">' + task.requestedFor + '</b></div>');
        }
        if (task.showQuantity) {
            template.print('<div style="' + fontSize + lineHeight + '">Quantity: <b>' + task.quantity + '</b></div>');
        }
        notificationUtil.setPricingtoTemplate(task, template);
        template.print('</div>');
    });
    if (totalTasks > 3) {
        template.print('<div style="padding-bottom:16px;padding-top:16px' + fontSize + lineHeight + '"><a style="color:#3C59E7" href="' + requestUrl + '">');
        template.print(gs.getMessage('View all items'));
        template.print('</a></div>');
    }

})(current, template, email, email_action, event);
