/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Fetch the latest domain before actually heading to publish.
    api.setState('op', event.payload.data.output);
    api.setState('finalizeClicked', true);
    api.data.get_user_domain_1.refresh();
}
