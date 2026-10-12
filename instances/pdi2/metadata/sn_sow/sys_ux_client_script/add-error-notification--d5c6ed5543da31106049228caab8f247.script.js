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
    const errorNotificationMessage = await helpers.translate("Something went wrong, please try again.");
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "alert1",
            status: "critical",
            icon: "circle-close-outline",
            content: errorNotificationMessage,
            action: {
                type: "dismiss"
            },
        }]
    });
}
