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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    switch (event.name) {
        case "NOW_INPUT#INVALID_SET":
            if (event.payload.value) {
                api.setState("disableContinuebutton", true);
            }
            break;
        case "NOW_INPUT#VALUE_SET":
            eventHandler.callUtilAPI({
                operation: "CHECK_SLOT_AVAILABILITY",
                sourceInstanceId: api.state.sourceInstanceId == "currentInstance" ? "" : api.state.sourceInstanceId,
                targetInstanceId: api.state.targetInstanceId,
                requestedTime: event.payload.value
            }, true);
            break;
    }

}
