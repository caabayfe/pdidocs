(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var requestItemId = current.sysapproval;
    var portalSuffix = new sn_ex_emp_fd.FoundationNotificationUtil().getPortalSuffix();
    var requestUrl = portalSuffix + '?id=ticket&table=sc_req_item&sys_id=' + requestItemId;
    var colorTheme = 'color: #4F52BD;';
    var fontSize = 'font-size: 16px;';
    var lineHeight = 'line-height: 24px;';
    var fontFamily = 'font-family: Lato, Arial, sans-serif;';
    var display = 'display: inline-block;';
    template.print('<div style="padding-bottom:32px"> <span style="margin-right: 4px;">View</span> <a href="' + requestUrl + '"');
    template.print('style="' + colorTheme + fontSize + fontFamily + display);
    template.print('">');
    template.print(gs.getMessage('approval request'));
    template.print('</a></div>');
    var request = {};
    request.requested_for = current.sysapproval.request.requested_for;
    request.opened_by = current.sysapproval.request.opened_by;

    var notificationUtil = new global.RequestNotificationUtil();
    var requestItemDetails = notificationUtil.getRequestItemDetails(requestItemId, request.requested_for, true);

    template.print('<div style="padding-bottom:16px; line-height:30px; font-size: 15pt;"><b style="font-weight: 600;">About this request</b></div>');
    template.print('<div style="padding-bottom:16px;">');
    if (requestItemDetails.showItemRequestedFor) {
        template.print('<div style="' + fontSize + lineHeight + '">Requested for: ' + '<b style="font-weight: 600;">' + requestItemDetails.requestedFor + '</b></div>');
    }
    if (request.requested_for.toString() !== request.opened_by.toString()) {
        template.print('<div style="' + fontSize + lineHeight + '">Opened by: ' + '<b style="font-weight: 600;">' + request.opened_by.name + '</b></div>');
    }

    template.print('<div style="' + fontSize + lineHeight + '">Short description: <b style="font-weight: 600;">' + requestItemDetails.item + '</b></div>');

    if (requestItemDetails.variables.length > 0) {
        notificationUtil.setRequestItemVariablestoTemplate(requestItemDetails, template);
    }
    if (requestItemDetails.showQuantity) {
        template.print('<div style="' + fontSize + lineHeight + '">Quantity: <b style="font-weight: 600;">' + requestItemDetails.quantity + '</b></div>');
    }
    notificationUtil.setPricingtoTemplate(requestItemDetails, template);
    template.print('</div>');

})(current, template, email, email_action, event);
