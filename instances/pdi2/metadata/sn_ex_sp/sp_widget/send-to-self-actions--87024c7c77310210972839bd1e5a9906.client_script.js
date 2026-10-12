function(spUtil, $rootScope, spModal, $window) {
    var c = this;
    c.sendChannel = c.data.sendChannel
    c.enableSendSMS = c.data.enableSendSMS;
    c.enableSendEmail = c.data.enableSendEmail;
    if (c.enableSendSMS) {
        c.twilioNumber = c.data.twilioNumber
    }
    c.userId = c.data.userId;
    c.userEmail = c.data.userEmail;
    c.userPhone = c.data.userPhone
    c.currentPageURL = $window.location.href;

    c.buttonsConfig = {
        email_and_sms: {
            title: "${Send to myself}"
        },
        email: {
            title: "${Email to myself}"
        },
        sms: {
            title: "${SMS to myself}"
        }
    }

    if (c.data.smsData) {
        if (!c.data.smsData.error)
            c.data.smsData.message = c.data.smsData.message + c.currentPageURL;

        c.buttonsConfig.sms.actionData = c.data.smsData;
    }

    if (c.data.emailData) {
        c.buttonsConfig.email.actionData = c.data.emailData;
    }

    c.onClick = function(action) {
        c.clickedAction = action;
        c.executeClickedAction(action);
    }

    c.assignDataForServerCall = function(action) {
        c.data.clickedAction = action;
        c.data.sendChannel = c.sendChannel;
        c.data.enableSendSMS = c.enableSendSMS;
        if (c.enableSendSMS) {
            c.data.twilioNumber = c.twilioNumber
        }
        c.data.enableSendEmail = c.enableSendEmail;
        c.data.userId = c.userId;
        c.data.userEmail = c.userEmail;
        c.data.userPhone = c.userPhone;

        if (c.buttonsConfig.sms.actionData)
            c.data.smsData = c.buttonsConfig.sms.actionData;
        if (c.buttonsConfig.email.actionData)
            c.data.emailData = c.buttonsConfig.email.actionData;
    }

    function openModelPopup(title, action, actionData) {
        if (actionData.error) {
            c.modelPopup = spModal.open({
                title: title,
                label: title,
                message: actionData.modelMessage,
                buttons: [{
                    label: "${Close}",
                    primary: true
                }]
            });
        } else {
            c.modelPopup = spModal.open({
                title: title,
                label: title,
                message: actionData.modelMessage,
                buttons: [{
                        label: "${Cancel}",
                        cancel: true
                    },
                    {
                        label: "${Confirm}",
                        primary: true
                    }
                ]
            });

            c.modelPopup.then(function(confirm) {
                if (!confirm.cancel) {
                    c.assignDataForServerCall(action);
                    if (action == 'sms') {
                        c.data.action = 'executeSendSMS';
                        c.data.smsData = c.buttonsConfig[c.clickedAction].actionData;
                        c.server.update().then(function(response) {
                            if(response.smsId) {
                                spUtil.addInfoMessage("${SMS sent successfully. If you don't receive it within the next hour, talk to your manager for help.}");
                            } else {
                                spUtil.addErrorMessage('${SMS could not be sent due to an unknown error. Talk to your manager for help.}')
                            }		
                        }).catch(function() {
                            spUtil.addInfoMessage('${SMS could not be sent due to an unknown error. Try again later.}');
                        })
                    } else if (action == 'email') {
                        c.data.action = 'executeSendEmail';
                        c.data.emailData = c.buttonsConfig[c.clickedAction].actionData
                        c.server.update().then(function(response) {
                            spUtil.addInfoMessage("${Email sent successfully. If you don't receive it within the next hour, talk to your manager for help.}");		
                        }).catch(function() {
                            spUtil.addInfoMessage('${Email could not be sent due to an unknown error. Try again later.}');
                        })
                    }
                }
            });
        }
    }

    c.executeClickedAction = function() {
        if (c.buttonsConfig[c.clickedAction].actionData) {
            openModelPopup(c.buttonsConfig[c.clickedAction].title, c.clickedAction, c.buttonsConfig[c.clickedAction].actionData);
        }
    }
}
