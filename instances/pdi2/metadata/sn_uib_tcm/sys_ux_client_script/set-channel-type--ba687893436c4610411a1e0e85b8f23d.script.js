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
    const selectedType = api.state.selectedType;
    const currSelectedType = event.payload.item.id;
    if (selectedType != currSelectedType) {
        api.setState("selectedChannel", null);
        api.setState("channelErrors", []);
        api.setState("selectedType", event.payload.item.id);
    }
}
