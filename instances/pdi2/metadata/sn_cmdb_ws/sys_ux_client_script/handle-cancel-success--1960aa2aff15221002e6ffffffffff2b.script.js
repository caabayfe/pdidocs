/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        SUCCESS_NOTIFICATION_PROPS,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();

    const notificationId = 'successId' + new Date().valueOf();
    let notifications = [{
        ...SUCCESS_NOTIFICATION_PROPS,
        id: notificationId,
        content: await helpers.translate("Task cancelled successfully")
    }];

   showNotificationWithAutoClose({api, helpers}, notifications);
}
