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
    let message = await helpers.translate("Your previous selection is deselected and {0} is selected", event.context.item.value.title);
    api.emit("SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED", {
        message: message,
        type: "polite"
    }); 
}
