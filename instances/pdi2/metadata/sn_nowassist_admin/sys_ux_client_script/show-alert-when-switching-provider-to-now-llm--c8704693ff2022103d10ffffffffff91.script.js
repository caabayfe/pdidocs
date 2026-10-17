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
            "id": "switchError",
            "status": "critical",
            "icon": "info-circle-outline",
            "content": await helpers.translate("Some error occurred while switching the provider."),
            "action": {
                "type": "dismiss"
            }
        }]
    });
}
