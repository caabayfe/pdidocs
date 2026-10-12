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
    api.setState('insightId', event.context.item.value.insightId);
    api.setState('insightStatus', 'closed');
    api.setState('insightLimit', api.state.insightLimit - 1);
}
