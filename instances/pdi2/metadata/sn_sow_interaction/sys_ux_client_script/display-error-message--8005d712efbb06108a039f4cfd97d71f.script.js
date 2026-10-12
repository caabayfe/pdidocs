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
    let errorMsgPrefix = await helpers.translate("Failed to associate the selected records. "),
        errorMsg = await helpers.translate("Try associating the record[s] again.");
 
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [
            {
                id: "err_msg",
                status: "critical",
                icon:"info-circle-outline",
                content: {
                    type: "html",
                    value: "<span><b>" + errorMsgPrefix + "</b>" + errorMsg + "</span>"
                },
                action: {
                    type: "dismiss"
                }
            }
        ]
    });
}
