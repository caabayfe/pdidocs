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

    var sysPropResult = api.data.look_up_sys_prop.result;

    if (!api.data.look_up_sys_prop.result || Object.keys(sysPropResult).length === 0) {
        api.setState("conversation_history_enabled", false);
        return;
    }

    var sysPropValue = api.data.look_up_sys_prop.result.value.value;
    var conversationHistoryEnabled = (sysPropValue.toLowerCase() == "true") ? true : false;
    api.setState("conversation_history_enabled", conversationHistoryEnabled);
}
