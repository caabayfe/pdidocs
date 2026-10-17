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
    if (event.payload && event.payload.eventName && event.payload.eventName === 'PLUGIN_CARD_NOTIFICATION') {
        api.setState('showDetailsContainer', false);
        api.data.ace_fetch_content_blocks.refresh();
    }
}
