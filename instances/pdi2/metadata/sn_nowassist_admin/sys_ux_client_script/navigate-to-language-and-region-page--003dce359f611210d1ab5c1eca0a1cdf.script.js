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
    if (event?.payload?.data?.output === "success") {
        api.emit("NAV_ITEM_SELECTED", {
            route: 'language-region',
            params: {
                t: Date.now()
            }
        });
    }
    else{
         api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "failure_alert",
                status: "critical",
                icon: "circle-info-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("Something went wrong. Changes could not be saved. Try again.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }
}
