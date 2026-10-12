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
    const statusArr = api?.context?.props?.status;
    var status = statusArr.split(":")[0];
    if (event?.payload?.name === "status" && status === "success") {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "prompt_injection_success_alert",
                status: "positive",
                icon: "circle-check-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("Changes saved.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

}
