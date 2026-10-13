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
        commTaskDetails
    } = api.state;
    const playBookCommunicationCardUtil = imports['sn_uib_tcm.PlayBookCommunicationCardUtil']();
    api.emit('NAV_ITEM_SELECTED', {
        "route": "task-comm",
        "targetRoute": "current",
        "title": await helpers.translate("New Communication"),
        "fields": {
            "table": playBookCommunicationCardUtil.CONSTANTS.INCIDENT_TABLE,
            "sysId": commTaskDetails.task_sys_id,
            "commTaskTable": commTaskDetails.commTaskTable
        }
    });
}
