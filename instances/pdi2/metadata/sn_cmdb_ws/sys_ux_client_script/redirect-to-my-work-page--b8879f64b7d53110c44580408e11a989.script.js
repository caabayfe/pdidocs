/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        TASK_PAGE_PARAMS
    } = imports["sn_cmdb_ws.CMDBWsDMTaskUtil"]();
    const {
        TASK_NOTIFICATION_MSG_CODES
    } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();

    const params = {};
    params[TASK_PAGE_PARAMS.MY_WORK.REFRESH_LIST] = Date.now() + '';

    const {
        elementId
    } = event;

    if (elementId === 'cmdb_data_manager_reject_task') {
        params[TASK_PAGE_PARAMS.MY_WORK.SHOW_NOTIFICATION] = TASK_NOTIFICATION_MSG_CODES.TASK_REJECT_SUCCESS;
    } else {
        params[TASK_PAGE_PARAMS.MY_WORK.SHOW_NOTIFICATION] = TASK_NOTIFICATION_MSG_CODES.TASK_APPR_SUCCESS;
    }
    helpers.navigate.to('my-work', {}, params);
}
