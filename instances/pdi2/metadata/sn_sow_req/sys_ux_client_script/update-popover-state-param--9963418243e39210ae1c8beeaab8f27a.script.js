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
    var popoverParam = {
        table: "sys_user"
    };
    if (event.elementId == "opened_by_preview") {
        var openedByInfo = api.data.record_information__request_1.output.openedByInfo;
        popoverParam.sys_id = openedByInfo.userInfo.sysId;
    } else {
        var requestedForInfo = api.data.record_information__request_1.output.sourceInfo;
        popoverParam.sys_id = requestedForInfo.requestorInfo.sysId;
    }
    api.setState("popoverParams", popoverParam);
}
