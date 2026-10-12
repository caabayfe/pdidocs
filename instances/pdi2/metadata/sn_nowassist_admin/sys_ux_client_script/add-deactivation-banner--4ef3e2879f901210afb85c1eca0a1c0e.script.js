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
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "offensiveness_deactivated_alert",
            status: "info",
            icon: "info-circle-outline",
            content: {
                type: "html",
                value: await helpers.translate("Offensiveness for {0} has been deactivated.", api?.state?.deactivateProductName)
            },
            action: {
                type: 'dismiss'
            }
        }]
    });
}
