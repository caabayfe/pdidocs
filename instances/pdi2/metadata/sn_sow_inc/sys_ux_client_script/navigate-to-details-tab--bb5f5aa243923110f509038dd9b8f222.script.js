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
    if (event.elementId == "edit_configuration" || (event.context.item && event.context.item.value && event.context.item.value.category && event.context.item.value.category.source && event.context.item.value.category.source == "INCIDENT"))
        api.emit("SOW_RECORD#ROUTE_REQUESTED", {
            route: "details",
            type: "record-tab"
        });
}
