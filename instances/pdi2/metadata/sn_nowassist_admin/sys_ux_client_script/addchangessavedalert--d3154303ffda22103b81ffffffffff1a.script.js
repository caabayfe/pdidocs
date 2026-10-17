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
            id: "changes_saved",
            status: "positive",
            icon: "circle-check-outline",
            content: {
                type: "html",
                value: await helpers.translate("Changes are saved.")
            },
            action: {
                "type": "dismiss"
            }
        }]
    });

}
