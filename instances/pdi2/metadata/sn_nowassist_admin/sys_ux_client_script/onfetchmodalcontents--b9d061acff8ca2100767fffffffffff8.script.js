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
    var output = event?.payload?.output;
    api.setState('modalTitle', output?.modalTitle);
    api.setState('modalSubtitle', output?.modalSubtitle);
    api.setState('modalButtonLabel', output?.modalButtonLabel);
}
