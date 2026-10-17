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
    if (!event || !event.context || !event.context.item || !event.context.item.value || !event.context.item.value.recordingLink)
        return;
    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: event.context.item.value.recordingLink
        }
    });
}
