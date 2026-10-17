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
    // Back to Change History
    api.emit('NAV_ITEM_SELECTED', {
        route: 'manage-llm-providers',
    });

}
