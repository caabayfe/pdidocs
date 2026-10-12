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
    const start = event.payload.start;
    const end = event.payload.end;
    api.setState('state_start_date', start);
    api.setState('state_end_date', end);
}
