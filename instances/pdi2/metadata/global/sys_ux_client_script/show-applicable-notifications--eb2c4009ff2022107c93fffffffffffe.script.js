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
    const { showNotification } = imports["global.APIAuthenticationConsoleUtil"]();
    if (api.data.apiauthenticationmessages_1.output && api.data.apiauthenticationmessages_1.output.message) {
        showNotification(api, "update_success", "positive", api.data.apiauthenticationmessages_1.output.message);
        removeNotification(helpers, "update_success")
    }
    
    function removeNotification(helpers, id) {
            helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{id: id}]
        }), 2000);
    }
}
