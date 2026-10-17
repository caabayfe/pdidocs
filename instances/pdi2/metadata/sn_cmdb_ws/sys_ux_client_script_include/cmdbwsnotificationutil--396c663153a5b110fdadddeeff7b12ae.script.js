function include({
    imports
}) {
    const ERROR_NOTIFICATION_PROPS = {
        "status": "critical",
        "icon": "exclamation-triangle-fill",
        "action": {
            "type": "dismiss"
        }
    };

    const SUCCESS_NOTIFICATION_PROPS = {
        "status": "positive",
        "icon": "check-circle-outline",
        "action": {
            "type": "dismiss"
        }
    }

    const INFO_NOTIFICATION_PROPS = {
        "status": "info",
        "icon": "circle-info-outline",
        "action": {
            "type": "dismiss"
        }
    }

   const WARNING_NOTIFICATION_PROPS = {
        "status": "warning",
        "icon": "circle-info-outline",
        "action": {
            "type": "dismiss"
        }
    }

    const showNotificationWithAutoClose = function(context, notificationItems, hideAfterMs = 5000) {
        const { api, helpers } = context;
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notificationItems
        });

        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: notificationItems
        }), hideAfterMs);
    };

   const showNotification = function(context, notificationItems) {
        const { api, helpers } = context;
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notificationItems
        });
    };

    return {
        ERROR_NOTIFICATION_PROPS,
        SUCCESS_NOTIFICATION_PROPS,
        INFO_NOTIFICATION_PROPS,
        WARNING_NOTIFICATION_PROPS,
        showNotificationWithAutoClose,
        showNotification
    }
}
