/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { TASK_PAGE_PARAMS } = imports["sn_cmdb_ws.CMDBWsDMTaskUtil"]();
    const { SUCCESS_NOTIFICATION_PROPS } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const { getNotificationMsg } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const {
        name: eventName,
        payload: {
            name: propName,
            previousValue,
            value
        }
    } = event;
    const { showNotification } = api.context.props;

    if ((eventName == "MACROPONENT_READY" && showNotification)
        || propName == TASK_PAGE_PARAMS.MY_WORK.SHOW_NOTIFICATION && value != "" && previousValue != value) {
        const notificationId = 'successId' + new Date().valueOf();
        let notifications = [{
            ...SUCCESS_NOTIFICATION_PROPS,
            id: notificationId,
            content: await getNotificationMsg(helpers, value || showNotification)
        }];

        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });

        if (notifications.length > 0) {
            notifications.forEach(item => {
                const timeoutId = helpers.timing.setTimeout(() => {
                    api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
                        items: [{id: notificationId}]
                    });

                    const params = {};
                    params[TASK_PAGE_PARAMS.MY_WORK.SHOW_NOTIFICATION] = '';

                    helpers.navigate.setRouteParams({'params': params});
                }, 5000);
            });
        }
    }
}
