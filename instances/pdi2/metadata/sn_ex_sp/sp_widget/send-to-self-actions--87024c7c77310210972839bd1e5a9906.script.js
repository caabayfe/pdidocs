(function() {
    var kbNumber = $sp.getParameter("sysparm_article");
    if (kbNumber) {
        data.query = 'number';
        data.queryValue = kbNumber;
    } else {
        var kbId = $sp.getParameter("sys_kb_id") ? $sp.getParameter("sys_kb_id") : $sp.getParameter("sys_id");
        data.query = 'sys_id';
        data.queryValue = kbId;
    }
    var sendToSelfUtil = new sn_ex_sp.SendToSelfUtil();
    data.kbGr = sendToSelfUtil.getKbGr(data.query, data.queryValue);

    if (!input) {

        data.portal = $sp.getPortalRecord();
        data.portalData = {
            portalId: data.portal.getUniqueValue(),
            portalName: data.portal.getDisplayValue("title"),
            portalSuffix: data.portal.getDisplayValue("url_suffix")
        }

        data.sendToSelfConfigGr = sendToSelfUtil.getSendToSelfConfigRecord(data.portalData.portalId);

        data.sendChannel = (!gs.nil(data.sendToSelfConfigGr) && !gs.nil(data.kbGr)) ? data.sendToSelfConfigGr.getValue('send_channel') : '';
        data.enableSendSMS = (options.enable_send_sms == 'true') && sendToSelfUtil.checkActivePlugin('com.snc.notify.twilio_direct') && (data.sendChannel == 'sms' || data.sendChannel == 'email_and_sms');
        if (data.enableSendSMS) {
            data.twilioNumber = data.sendToSelfConfigGr.getValue('twilio_number');
            data.enableSendSMS = data.enableSendSMS && !gs.nil(data.twilioNumber);
        }

        data.enableSendEmail = (options.enable_send_email == 'true') && (data.sendChannel == 'email' || data.sendChannel == 'email_and_sms');
        data.user = sendToSelfUtil.getUserContactDetails();
        data.userId = data.user.userId;
        data.userEmail = data.user.email;
        data.userPhone = data.user.phone;
        data.smsData = {};
        data.emailData = {};

        if (sendToSelfUtil.checkActivePlugin('com.sn_hr_core')) {
            data.requestProfileElement = sendToSelfUtil.getRequestProfileUpdateElement(data.portalData.portalSuffix);
        }

        if (options.enable_send_sms && data.sendChannel) {
            if (data.userPhone) {
                var message = gs.getMessage('{0} \nView the full article at: ', data.kbGr.short_description.trim());
                data.smsData = {
                    message: message,
                    modelMessage: gs.getMessage('This will send a link to the article "{0}" as an SMS to your phone number {1}', [data.kbGr.short_description.trim(), data.userPhone])
                };
            } else {
                data.smsData.error = true;
                if (data.requestProfileElement) {
                    data.smsData.modelMessage = '<div>'.concat(gs.getMessage('Unable to send SMS as there is no phone number available.'), '</div><div>', gs.getMessage('To add a phone number to your profile, submit a profile update request here:'), '</div>', data.requestProfileElement);
                } else {
                    data.smsData.modelMessage = '<div>'.concat(gs.getMessage('Unable to send SMS as there is no phone number available.'), '</div><div>', gs.getMessage('To add a phone number to your profile, contact your manager.'), '</div>');
                }
            }
        }

        if (options.enable_send_email && data.sendChannel) {
            if (data.userEmail) {
                var subject = gs.getMessage("Article: {0}", data.kbGr.short_description.trim());
                data.emailData = {
                    eventName: "sn_ex_sp.knowledge.send_email",
                    subject: subject,
                    modelMessage: gs.getMessage('This will send the article "{0}" as an email to your email address {1}', [data.kbGr.short_description.trim(), data.userEmail])
                };
            } else {
                data.emailData.error = true;
                if (data.requestProfileElement) {
                    data.emailData.modelMessage = '<div>'.concat(gs.getMessage('Unable to send email as there is no email address available.'), '</div><div>', gs.getMessage('To add an email address to your profile, submit a profile update request here:'), '</div>', data.requestProfileElement);
                } else {
                    data.emailData.modelMessage = '<div>'.concat(gs.getMessage('Unable to send email as there is no email address available.'), '</div><div>', gs.getMessage('To add an email address to your profile, contact your manager.'), '</div>');
                }
            }
        }
    }

    if (input && input.action == "executeSendSMS") {
        data.smsId = sn_notify.NotifyScoped.sendSMS(input.twilioNumber, input.userPhone, input.smsData.message, data.kbGr);
        sendToSelfUtil.insertOrUpdateUsageCount(input.portalData.portalId, 'knowledge', 'sms', input.userId);
    } else if (input && input.action == "executeSendEmail") {
        gs.eventQueue(input.emailData.eventName, data.kbGr, JSON.stringify(input.portalData), input.userId);
        sendToSelfUtil.insertOrUpdateUsageCount(input.portalData.portalId, 'knowledge', 'email', input.userId);
    }

})();
