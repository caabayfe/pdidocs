/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { SUCCESS_NOTIFICATION_PROPS, showNotificationWithAutoClose } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const { getNotificationMsg } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const { name, previousValue, value } = event.payload;

    if (name == 'showNotification' && value != "" && previousValue != value) {
        const notificationId = 'successId' + new Date().valueOf();
        let notifications = [{
            ...SUCCESS_NOTIFICATION_PROPS,
            id: notificationId,
            content: await getNotificationMsg(helpers, value)
        }];
        showNotificationWithAutoClose({api, helpers}, notifications);

        helpers.navigate.setRouteParams({'params': {showNotification: '', ts: Date.now()}});
    }
}
