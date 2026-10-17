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
    api.setState("selectedCE", event.payload.value);
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
        eventPayload: {
            variableName: 'ns_selected_ce_delivery',
            variableValue: event.payload.value,
            selectedVAList: api?.state?.selectedVAList
        }
    });
}
