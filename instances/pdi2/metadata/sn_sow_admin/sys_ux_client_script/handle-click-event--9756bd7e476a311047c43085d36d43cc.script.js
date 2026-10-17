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
    const payload = event.payload.eventPayload;
    if (payload && payload.eventName && payload.eventName.indexOf('INTERACTIVE_CARD_CLICKED') >= 0) {
        var event = payload.eventName.split("#");
        var name = event[1];
        api.emit('NAV_ITEM_SELECTED', {
            route: name
        });
    }
}
