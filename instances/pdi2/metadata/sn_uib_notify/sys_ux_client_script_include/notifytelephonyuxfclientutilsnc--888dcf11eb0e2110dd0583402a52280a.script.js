function include({
    imports
}) {
    class NotifyTelephonyUxfClientUtilSNC {

        static TELEPHONY_PROVIDER = "Telephony";
        static GFORM_ADD_INFO_MESSAGE = "GFORM#ADD_INFO_MESSAGE";

        static showAlert(api, message, level) {
            var payload = {
                "items": [{
                    "id": "notify-sms-error-message",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": message,
                    "status": level,
                }]
            };
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', payload);
        };

        static showMultipleAlerts(api, alerts) {
            let alertsPayload = {
                items: []
            };
            for (let index in alerts) {
                var payload = {
                    "id": `notify-sms-error-message-${index}`,
                    "action": {
                        "type": "dismiss"
                    },
                    "content": alerts[index].message,
                    "status": alerts[index].level,
                };
                alertsPayload.items.push(payload);
            }
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', alertsPayload);
        };

        static handleSmsResponse(api, helpers) {
            const isParentRecordAware = api.context.props.isParentRecordAware || false;
            const responseData = api.data.notify_send_sms.output;
            let alerts = [];
            if (responseData.status === true) {
                if (responseData.successMessages.length > 0) {
                    for (let index in responseData.successMessages) {
                        if (!isParentRecordAware) {
                            alerts.push({
                                message: responseData.successMessages[index],
                                level: "info"
                            });
                        }
                        else {
                            api.emit(this.GFORM_ADD_INFO_MESSAGE, {
                                message: responseData.successMessages[index]
                            });
                        }
                    }
                };
                helpers.modal.close();
                if (!isParentRecordAware) {
                    this.showMultipleAlerts(api, alerts);
                }
            }
            else {
                api.setState("showLoader", false);
                if (responseData.errorMessages.length > 0) {
                    for (let index in responseData.errorMessages) {
                        alerts.push({
                            message: responseData.errorMessages[index],
                            level: "critical"
                        });
                    }
                };

                for (let index in responseData.warnMessages) {
                    alerts.push({
                        message: responseData.warnMessages[index],
                        level: "warning"
                    });
                }
            }
            this.showMultipleAlerts(api, alerts);
        };

    };

    return NotifyTelephonyUxfClientUtilSNC;
}
