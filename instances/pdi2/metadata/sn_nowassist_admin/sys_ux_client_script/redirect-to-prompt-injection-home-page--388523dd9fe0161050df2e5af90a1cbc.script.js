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
    var timeStamp = Date.now().toString();
    const isUpdated = event?.payload?.data?.output;
    if (isUpdated) {
        api.emit("NAV_ITEM_SELECTED", {
            route: 'prompt-injection',
            params: {
                t: Date.now(),
            status : "success:"+timeStamp
            }
        });
    } else {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "failure_alert",
                status: "critical",
                icon: "circle-info-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("Something went wrong while configuring Prompt Injection. Please try again.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }
}
