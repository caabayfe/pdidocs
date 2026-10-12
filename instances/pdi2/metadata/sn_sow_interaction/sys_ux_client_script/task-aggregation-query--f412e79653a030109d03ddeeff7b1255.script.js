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
    const callerID = api.context.props.userSysId;
    if (callerID) {
        api.setState("openedForSysId", callerID);
        api.setState('recentInteractionsQuery', "opened_for=" + callerID + '^sys_id!=' + api.context.props.interactionSysId + '^EQ');
        helpers.translate("User's Interactions").then(
            val => api.setState('viewAllInteractionsTitle', val)
        );
    } else {
        api.setState("openedForSysId", "-1");
        api.setState("activeRecordsHeader", "");
        api.setState("responseString", "");
        api.setState("hasRecentTasks", false);
    }
}
