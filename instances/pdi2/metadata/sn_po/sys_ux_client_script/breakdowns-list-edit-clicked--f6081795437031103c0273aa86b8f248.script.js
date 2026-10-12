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
    // Selected breakdown ID is reset to trigger a network incase user clicks on the same activity twice
    api.setState('selectedBreakdownID', '');
    api.setState('selectedBreakdownID', event.payload.sys_id);
}
