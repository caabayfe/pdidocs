/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/ 
async function handler({api, event, helpers, imports}) {
    const { SUCCESS_NOTIFICATION_PROPS, showNotificationWithAutoClose } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const { getNotificationMsg, SETTINGS_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();

    const notificationId = 'successId' + new Date().valueOf();
    let notifications = [{
        ...SUCCESS_NOTIFICATION_PROPS,
        id: notificationId,
        content: await getNotificationMsg(helpers, SETTINGS_MSG_CODES.SAVE_SETTINGS_SUCCESS)
    }];
    showNotificationWithAutoClose({api, helpers}, notifications);
    api.setState('isSettingsPageDirty', false);
    api.data.getDMProperties.refresh();
}
