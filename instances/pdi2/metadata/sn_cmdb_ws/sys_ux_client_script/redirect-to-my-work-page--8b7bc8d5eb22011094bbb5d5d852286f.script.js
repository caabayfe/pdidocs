/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { TASK_PAGE_PARAMS } = imports["sn_cmdb_ws.CMDBWsDMTaskUtil"]();
    const { TASK_NOTIFICATION_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();

    const params = {
        [TASK_PAGE_PARAMS.MY_WORK.REFRESH_LIST]: Date.now() + ''
    };

    const { elementId } = event;
    if (elementId === 'cancel_task') {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
        return;
    }
    helpers.navigate.to('my-work', {}, params);
}
