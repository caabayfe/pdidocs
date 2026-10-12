(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
    var requestUrl = '/' + portalSuffix + '?id=order_status&table=sc_request&sys_id=' + current.sys_id;
    var buttonText = gs.getMessage('View request');
    //Generates primary action of view request
    var requestNotificationJs = new global.RequestNotificationUtil();
    requestNotificationJs.createNotificationPrimayAction(template, requestUrl, buttonText);

    //request details required for notification template
    var requestDetails = requestNotificationJs.getRequestDetails(current.sys_id, current);


    template.print('<div style="font-size: 15pt; line-height:30px; padding-bottom:16px"><b style="font-weight:600">About this request</b></div>');

    var priceDisplay = gs.getProperty('glide.sc.price.display');
    var showRequestPrice = false;
    if (requestDetails.totalTasks > 1 && priceDisplay !== 'never' && current.price > 0) {
        showRequestPrice = true;
    }
    var showOpenedBy = false;
    if (current.opened_by.toString() !== current.requested_for.toString()) {
        showOpenedBy = true;
    }
    var requestItemsPadding = 'padding-top:16px;';
    if (showOpenedBy || showRequestPrice) {
        template.print('<div style="padding-bottom:16px">');

        if (showOpenedBy) {
            if (requestDetails.showRequestedFor) {
                template.print('<div>Requested for: ' + '<b style="font-weight:600">' + current.requested_for.name + '</b></div>');
            }
            template.print('<div>Opened by: ' + '<b style="font-weight:600">' + current.opened_by.name + '</b></div>');
        }

        if (showRequestPrice) {
            var recurringPriceText = requestNotificationJs.gerRecurringPriceRollup(current.sys_id);
            template.print('<div>Total price: ' + '<b style="font-weight:600">' + current.price.getDisplayValue() + '</b><span style="font-size:14px;font-weight: 600">' + recurringPriceText + '</span></div>');
        }
        template.print('</div>');
    } else {
        requestItemsPadding = '';
    }

    if (requestDetails.totalTasks > 1) {

        template.print('<div style="font-size: 12pt;font-weight:600;' + requestItemsPadding + '">Requested items (' + requestDetails.totalTasks + ')</div>');
    }
    requestDetails.tasks.forEach(function(task, index) {
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
        template.print('<div>Requested item number: <b style="font-weight:600">' + task.requestNumber + '</b></div>');
        template.print('<div>Short description: <b style="font-weight:600">' + task.item + '</b></div>');
        if (task.showItemRequestedFor) {
            template.print('<div>Requested for: <b style="font-weight:600">' + task.requestedFor + '</b></div>');
        }
        if (task.showQuantity) {
            template.print('<div>Quantity: <b style="font-weight:600">' + task.quantity + '</b></div>');
        }
        requestNotificationJs.setPricingtoTemplate(task, template);
        template.print('</div>');
    });
    if (requestDetails.totalTasks > 3) {
        template.print('<div style="padding-bottom:16px;padding-top:16px;color:#3C59E7"><a href="' + requestUrl + '">');
        template.print(gs.getMessage('View all items'));
        template.print('</a></div>');
    }
})(current, template, email, email_action, event);
