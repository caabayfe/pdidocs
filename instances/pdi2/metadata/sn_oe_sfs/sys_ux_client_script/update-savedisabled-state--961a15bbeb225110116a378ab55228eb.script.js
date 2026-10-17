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
    if (event.payload.fieldValue === api.data.look_up_record_1.result.value.value) {
        api.setState('saveDisabled', true);
    } else if (event.elementId === 'look_up_record_1' && event.name === 'DATA_FETCH_SUCCEEDED') {
        api.setState('saveDisabled', true);
    } else {
        api.setState('saveDisabled', false);
    }
}
