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
    if (api.data.look_up_record_1.result.time_zone.value) {
        api.setState('timeZone', api.data.look_up_record_1.result.time_zone.displayValue);
    }
}
